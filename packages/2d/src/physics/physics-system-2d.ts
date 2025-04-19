import { OctTree, ReadonlyVector2d, Vector2d } from "@pluto/core";
import { CollisionMnemento } from "./collision-mnemento";
import { DynamicBody } from "./dynamic-body";
import { StaticBody2d } from "./static-body-2d";
import { StaticBoxedBody2d } from "./static-boxed-body-2d";
import { StaticBorder2d } from "./static-border-2d";

export interface PhysicsSystem2dData {
    globalAcceleration?: ReadonlyVector2d | undefined;
    simulationSteps?: number | undefined;
}

export class PhysicsSystem2d {

    globalAcceleration: Vector2d;
    simulationSteps: number;

    private readonly staticBodies = OctTree.withMinimumNumberOfElements<StaticBody2d>(1000);
    private readonly borders: StaticBorder2d[] = [];
    private readonly dynamicBodies = OctTree.withMinimumNumberOfElements<DynamicBody>(1000);

    constructor(data?: Readonly<PhysicsSystem2dData>) {
        this.simulationSteps = data?.simulationSteps ?? 1;
        this.globalAcceleration = data?.globalAcceleration?.clone() ?? new Vector2d(0, 0);
    }

    addBorder(line: StaticBorder2d): StaticBorder2d {
        this.borders.push(line);
        return line;
    }

    addDynamicBody<T extends DynamicBody>(body: T): T {
        this.dynamicBodies.addSolid(body, body.boundingBox);
        return body;
    }

    addStaticBody<T extends StaticBoxedBody2d>(body: T): T {
        this.staticBodies.addSolid(body, body.boundingBox);
        return body;
    }

    render() {
        this.borders.forEach(it => it.render());
        this.staticBodies.forEach(it => it.render());
    }

    rebuild(minNumberOfElements?: number) {
        this.staticBodies.rebuild({ minNumberOfElements });
        this.dynamicBodies.rebuild({ minBox: this.staticBodies.boundingBox, minNumberOfElements });
    }

    removeBorder(line: StaticBorder2d) {
        const i = this.borders.indexOf(line);
        if (i >= 0) {
            this.borders.splice(i, 1);
        }
    }

    removeDynamicBody(body: DynamicBody) {
        this.dynamicBodies.removeSolid(body, body.boundingBox);
    }

    removeStaticBody(body: StaticBoxedBody2d) {
        this.staticBodies.removeSolid(body, body.boundingBox);
    }

    simulate(timeout: number) {
        const dt = timeout / this.simulationSteps;
        for (let i = 0; i < this.simulationSteps; ++i) {
            this.simulateStep(dt);
        }
    }

    private _presimulate(timeout: number) {
        this.dynamicBodies.forEach(body => {
            body.presimulate(this.globalAcceleration, timeout);
        });
    }

    private simulateStep(timeout: number) {
        this._presimulate(timeout);
        this._simulateSpeed(timeout);
        this._simulateCollisions(timeout);
    }

    private _simulateSpeed(timeout: number) {
        this._updateSimulatedBodiesBoundingBox(timeout);
        this.dynamicBodies.forEach(body => {
            if (body.enabled) {
                this.borders.forEach(line => {
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
        this.dynamicBodies.forEach(body => {
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
            this.dynamicBodies.forEach(body => {
                if (body.enabled) {
                    this.borders.forEach(line => {
                        if (line.enabled && body.overlapsZRange(line)) {
                            body.getStaticCollision(line, mnemento);
                        }
                    });
                    this.staticBodies.forEachInBox(body.boundingBox, statBody => {
                        if (statBody.enabled && body.overlapsZRange(statBody)) {
                            body.getStaticCollision(statBody, mnemento);
                        }
                    });
                    this.dynamicBodies.forEachInBox(body.boundingBox, other => {
                        if (other.enabled && other !== body) {
                            body.getDynamicCollision(other, mnemento);
                        }
                    });
                }
            });
            if (mnemento.hasCollisions) {
                this.simulatePositions(mnemento.timeout);
                timeout -= mnemento.timeout;
                mnemento.processCollisions();
            } else {
                this.simulatePositions(timeout);
                break;
            }
        }
    }

    private simulatePositions(timeout: number) {
        this.dynamicBodies.forEach(body => {
            if (body.enabled) {
                body.simulatePosition(timeout);
            }
        });
    }

    private _updateSimulatedBodiesBoundingBox(timeout: number) {
        this.dynamicBodies.moveAllSolidsIf(it => it.enabled, it => {
            it.updateDynamicBoundingBox(timeout);
            return it.boundingBox;
        });
    }
}