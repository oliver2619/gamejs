import { OctTree, ReadonlyVector2, Vector2 } from "core";
import { AnimatedBody } from "./animated-body";
import { CollisionMnemento } from "./collision-mnemento";
import { SimulatedBody } from "./simulated-body";
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
    private readonly simulatedBodies = new OctTree<SimulatedBody>(4);
    private readonly animatedBodies = new OctTree<AnimatedBody>(4);
    private readonly simulationSteps: number;

    constructor(data: PhysicsSystemData) {
        this.simulationSteps = data.simulationSteps == undefined ? 1 : data.simulationSteps;
        this.globalAcceleration = data.globalAcceleration == undefined ? new Vector2(0, 0) : data.globalAcceleration.clone();
    }

    addAnimatedBody(body: AnimatedBody): AnimatedBody {
        this.animatedBodies.addSolid(body, body.staticBoundingBox);
        return body;
    }

    addDynamicBody<T extends SimulatedBody>(body: T): T {
        this.simulatedBodies.addSolid(body, body.staticBoundingBox);
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

    rebuild() {
        this.staticBodies.rebuild();
        this.simulatedBodies.rebuild(this.staticBodies.boundingBox);
    }

    removeAnimatedBody(body: AnimatedBody) {
        this.animatedBodies.removeSolid(body, body.staticBoundingBox);
    }

    removeDynamicBody(body: SimulatedBody) {
        this.simulatedBodies.removeSolid(body, body.staticBoundingBox);
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
        this.simulatedBodies.forEach(body => {
            if (body.enabled) {
                body.resetForcesAndConstraints(this.globalAcceleration);
            }
        });
        this.simulatedBodies.forEach(body => {
            if (body.enabled) {
                body.onPreSimulate.produce({ body, timeout });
            }
        });
        this.animatedBodies.forEach(body => {
            if (body.enabled) {
                body.onPreAnimate.produce({ body, timeout });
            }
        });
        this.animatedBodies.forEach(body => {
            if(body.enabled) {
                body.simulateSpeed(timeout);
            }
        });
        this.simulatedBodies.forEach(body => {
            if (body.enabled) {
                this.staticLines.forEach(line => {
                    if (line.enabled && body.overlapsZRange(line)) {
                        body.getStaticForceConstraints(line);
                    }
                });
                this.staticBodies.forEachInBox(body.staticBoundingBox, statBody => {
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
        while (timeout > 0) {
            const mnemento = new CollisionMnemento(timeout);
            this.simulatedBodies.forEach(body => {
                if (body.enabled) {
                    this.staticLines.forEach(line => {
                        if (line.enabled && body.overlapsZRange(line)) {
                            body.getStaticCollision(line, mnemento);
                        }
                    });
                    this.staticBodies.forEachInBox(body.getDynamicBoundingBox(timeout), statBody => {
                        if (statBody.enabled && body.overlapsZRange(statBody)) {
                            body.getStaticCollision(statBody, mnemento);
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
        this.animatedBodies.forEach(body => {
            if(body.enabled) {
                body.simulatePosition(timeout);
            }
        });
    }
}