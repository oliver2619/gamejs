import { ReadonlyVector2d, Vector2d } from "@pluto/core";

export interface PhysicsSystemData {
    globalAcceleration: ReadonlyVector2d;
    simulationSteps?: number;
}

export class PhysicsSystem {

    globalAcceleration: Vector2d;

    private readonly simulationSteps: number;

    constructor(data: Readonly<PhysicsSystemData>) {
        this.globalAcceleration = data.globalAcceleration.clone();
        this.simulationSteps = data.simulationSteps ?? 1;
    }

    render() {
        // TODO
    }

    simulate(timeout: number) {
        const dt = timeout / this.simulationSteps;
        for (let i = 0; i < this.simulationSteps; ++i) {
            this._simulate(dt);
        }
    }

    private _simulate(_: number) {
        // TODO
    }

}