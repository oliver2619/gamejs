import { ReadonlyVector2, Vector2 } from "core";

interface ForceConstraint {

    getForce(v: ReadonlyVector2): Vector2;
}

// TODO real physical spring model
class ForceConstraintPlane implements ForceConstraint {

    constructor(readonly normal: ReadonlyVector2, readonly intrusion: number) {
    }

    getForce(v: ReadonlyVector2): Vector2 {
        const dot = v.getDotProduct(this.normal);
        if (dot < 0) {
            return this.normal.getScaled(-dot * this.intrusion);
        } else {
            return new Vector2(0, 0);
        }
    }
}

export class ForceConstraints {

    private readonly constraints: ForceConstraint[] = [];

    addPlane(normal: ReadonlyVector2, intrusion: number) {
        this.constraints.push(new ForceConstraintPlane(normal, intrusion));
    }

    applyAcceleration(acceleration: Vector2) {
        const sum = new Vector2(0, 0);
        this.constraints.forEach(c => sum.add(c.getForce(acceleration)));
        acceleration.add(sum);
    }

    applySpeed(speed: Vector2) {
        const sum = new Vector2(0, 0);
        this.constraints.forEach(c => sum.add(c.getForce(speed)));
        speed.add(sum);
    }

    reset() {
        this.constraints.splice(0, this.constraints.length);
    }
}