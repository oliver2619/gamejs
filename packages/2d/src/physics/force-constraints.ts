import { ReadonlyVector2d, Vector2d } from "@pluto/core";

interface ForceConstraint {

    getForce(v: ReadonlyVector2d): Vector2d;
}

class ForceConstraintPlane implements ForceConstraint {

    constructor(readonly normal: ReadonlyVector2d, readonly intrusion: number) {
    }

    getForce(v: ReadonlyVector2d): Vector2d {
        const dot = v.getDotProduct(this.normal);
        if (dot < 0) {
            return this.normal.getScaled(-dot * this.intrusion);
        } else {
            return new Vector2d(0, 0);
        }
    }
}

export class ForceConstraints {

    private readonly constraints: ForceConstraint[] = [];

    addPlane(normal: ReadonlyVector2d, intrusion: number) {
        this.constraints.push(new ForceConstraintPlane(normal, intrusion));
    }

    applyAcceleration(acceleration: Vector2d) {
        const sum = new Vector2d(0, 0);
        this.constraints.forEach(c => sum.add(c.getForce(acceleration)));
        acceleration.add(sum);
    }

    applySpeed(speed: Vector2d) {
        const sum = new Vector2d(0, 0);
        this.constraints.forEach(c => sum.add(c.getForce(speed)));
        speed.add(sum);
    }

    reset() {
        this.constraints.splice(0, this.constraints.length);
    }
}