import { OctTree, ReadonlyVector2d, Vector2d } from "@pluto/core";
import { CollisionMnemento } from "./collision-mnemento";
import { DynamicBody } from "./dynamic-body";
import { StaticBody } from "./static-body";
import { StaticBoxedBody } from "./static-boxed-body";
import { StaticLine } from "./static-line";
import { StaticPoint } from "./static-point";

export interface PhysicsSystemData {

    readonly globalAcceleration: ReadonlyVector2d;
    readonly simulationSteps?: number;
}

export class PhysicsSystem {

    globalAcceleration: Vector2d;

    private readonly staticBodies = OctTree.withMinimumNumberOfElements<StaticBody>(1000);
    private readonly staticLines: StaticLine[] = [];
    private readonly simulatedBodies = OctTree.withMinimumNumberOfElements<DynamicBody>(1000);
    private readonly simulationSteps: number;

    constructor(data: PhysicsSystemData) {
        this.simulationSteps = data.simulationSteps == undefined ? 1 : data.simulationSteps;
        this.globalAcceleration = data.globalAcceleration == undefined ? new Vector2d(0, 0) : data.globalAcceleration.clone();
    }

    addDynamicBody<T extends DynamicBody>(body: T): T {
        this.simulatedBodies.addSolid(body, body.boundingBox);
        return body;
    }

    addStaticBody<T extends StaticBoxedBody>(body: T): T {
        this.staticBodies.addSolid(body, body.boundingBox);
        return body;
    }

    addStaticLine(line: StaticLine): StaticLine {
        this.staticLines.push(line);
        return line;
    }

    addStaticPoint(point: StaticPoint): StaticPoint {
        this.staticBodies.addPoint(point, point.pointIn3d);
        return point;
    }

    render() {
        this.staticLines.forEach(it => it.render());
        this.staticBodies.forEach(it => it.render());
    }

    rebuild(minNumberOfElements?: number) {
        this.staticBodies.rebuild({ minNumberOfElements });
        this.simulatedBodies.rebuild({ minBox: this.staticBodies.boundingBox, minNumberOfElements });
    }

    removeDynamicBody(body: DynamicBody) {
        this.simulatedBodies.removeSolid(body, body.boundingBox);
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

    private _presimulate(timeout: number) {
        this.simulatedBodies.forEach(body => {
            if (body.enabled) {
                body.resetForcesAndConstraints(this.globalAcceleration);
            }
        });
        this.simulatedBodies.forEach(body => {
            if (body.enabled) {
                body.onPreSimulate.next({ body, timeout });
            }
        });
    }

    private _simulate(timeout: number) {
        this._presimulate(timeout);
        this._simulateSpeed(timeout);
        this._simulateCollisions(timeout);
    }

    private _simulateSpeed(timeout: number) {
        this._updateSimulatedBodiesBoundingBox(timeout);
        this.simulatedBodies.forEach(body => {
            if (body.enabled) {
                this.staticLines.forEach(line => {
                    if (line.enabled && body.overlapsZRange(line)) {
                        body.getStaticForceConstraints(line);
                    }
                });
                this.staticBodies.forEachInBox(body.boundingBox, statBody => {
                    if (statBody.enabled && body.overlapsZRange(statBody)) {
                        body.getStaticForceConstraints(statBody);
                    }
                });
            }
        });
        this.simulatedBodies.forEach(body => {
            if (body.enabled) {
                body.applyStaticForceConstraints();
                body.simulateSpeed(timeout);
            }
        });
    }

    private _simulateCollisions(initialTimeout: number) {
        let timeout = initialTimeout;
        while (timeout > 0) {
            this._updateSimulatedBodiesBoundingBox(timeout);
            const mnemento = new CollisionMnemento(timeout);
            this.simulatedBodies.forEach(body => {
                if (body.enabled) {
                    this.staticLines.forEach(line => {
                        if (line.enabled && body.overlapsZRange(line)) {
                            body.getStaticCollision(line, mnemento);
                        }
                    });
                    this.staticBodies.forEachInBox(body.boundingBox, statBody => {
                        if (statBody.enabled && body.overlapsZRange(statBody)) {
                            body.getStaticCollision(statBody, mnemento);
                        }
                    });
                    this.simulatedBodies.forEachInBox(body.boundingBox, other => {
                        if (other.enabled && other !== body) {
                            body.getDynamicCollision(other, mnemento);
                        }
                    });
                }
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
        this.simulatedBodies.forEach(body => {
            if (body.enabled) {
                body.simulatePosition(timeout);
            }
        });
    }

    private _updateSimulatedBodiesBoundingBox(timeout: number) {
        this.simulatedBodies.moveAllSolidsIf(it => it.enabled, it => {
            it.updateDynamicBoundingBox(timeout);
            return it.boundingBox;
        });
    }
}