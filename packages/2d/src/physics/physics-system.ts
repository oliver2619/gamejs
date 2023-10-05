import { OctTree, ReadonlyVector2, Vector2 } from "core/src/index";
import { CollisionMnemento } from "./collision-mnemento";
import { DynamicBody } from "./dynamic-body";
import { StaticBody } from "./static-body";
import { StaticBoxedBody } from "./static-boxed-body";
import { StaticLine } from "./static-line";
import { StaticPoint } from "./static-point";

export interface PhysicsSystemData {

    readonly globalAcceleration: ReadonlyVector2;
    readonly simulationSteps?: number;
}

export class PhysicsSystem {

    globalAcceleration: Vector2;

    private readonly staticBodies = new OctTree<StaticBody>(4);
    private readonly staticLines: StaticLine[] = [];
    private readonly dynamicBodies = new OctTree<DynamicBody>(4);
    private readonly simulationSteps: number;

    constructor(data: PhysicsSystemData) {
        this.simulationSteps = data.simulationSteps == undefined ? 1 : data.simulationSteps;
        this.globalAcceleration = data.globalAcceleration == undefined ? new Vector2(0, 0) : data.globalAcceleration.clone();
    }

    addDynamicBody(body: DynamicBody) {
        this.dynamicBodies.addSolid(body, body.staticBoundingBox);
    }

    addStaticBody(body: StaticBoxedBody) {
        this.staticBodies.addSolid(body, body.boundingBox);
    }

    addStaticLine(line: StaticLine) {
        this.staticLines.push(line);
    }

    addStaticPoint(point: StaticPoint) {
        this.staticBodies.addPoint(point, point.pointIn3d);
    }

    rebuild() {
        this.staticBodies.rebuild();
        this.dynamicBodies.rebuild(this.staticBodies.boundingBox);
    }

    removeDynamicBody(body: DynamicBody) {
        this.dynamicBodies.removeSolid(body, body.staticBoundingBox);
    }

    removeStaticBody(body: StaticBoxedBody) {
        this.staticBodies.removeSolid(body, body.boundingBox);
    }

    removeStaticLines(line: StaticLine) {
        const i = this.staticLines.indexOf(line);
        if (i >= 0) {
            this.staticLines.splice(i, 1);
        }
    }

    removeStaticPoint(point: StaticPoint) {
        this.staticBodies.removePoint(point, point.pointIn3d);
    }

    simulate(timeout: number) {
        const dt = timeout / this.simulationSteps;
        for (let i = 0; i < this.simulationSteps; ++i) {
            this._simulate(dt);
        }
    }

    private _simulate(timeout: number) {
        this.dynamicBodies.forEach(body => {
            body.resetForcesAndConstraints(this.globalAcceleration);
        });
        this.dynamicBodies.forEach(body => {
            this.staticLines.forEach(line => body.getStaticForceConstraints(line));
            this.staticBodies.forEachInBox(body.staticBoundingBox, statBody => {
                body.getStaticForceConstraints(statBody);
            });
        });
        this.dynamicBodies.forEach(body => {
            body.applyStaticForceConstraints();
            body.simulateSpeed(timeout);
        });
        while (timeout > 0) {
            const mnemento = new CollisionMnemento(timeout);
            this.dynamicBodies.forEach(body => {
                this.staticLines.forEach(line => body.getStaticCollision(line, mnemento));
                this.staticBodies.forEachInBox(body.getDynamicBoundingBox(timeout), statBody => body.getStaticCollision(statBody, mnemento));
            });
            if (mnemento.hasCollisions) {
                this._simulateStep(mnemento.timeout);
                timeout -= mnemento.timeout;
                mnemento.processCollisions();
            } else {
                this._simulateStep(timeout);
                break;
            }
        }
    }

    private _simulateStep(timeout: number) {
        this.dynamicBodies.forEach(body => {
            body.simulatePosition(timeout);
        });
    }
}