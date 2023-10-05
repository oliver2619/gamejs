import {ReadonlyVector2, Vector2} from "core/src/index";

interface ForceConstraint {

    applyAcceleration(v: Vector2): void;

    applySpeed(v: Vector2): void;
}

class ForceConstraintPlane implements ForceConstraint {

    constructor(readonly normal: ReadonlyVector2, readonly intrusion: number) {
    }

    applyAcceleration(v: Vector2) {
        const dot = v.getDotProduct(this.normal);
        if (dot < 0) {
            v.addScaled(this.normal, -dot);
        }
    }

    applySpeed(v: Vector2) {
        const dot = v.getDotProduct(this.normal);
        if (dot < 0) {
            v.addScaled(this.normal, -dot);
        }
    }
}

export class ForceConstraints {

    private readonly constraints: ForceConstraint[] = [];

    addPlane(normal: ReadonlyVector2, intrusion: number) {
        this.constraints.push(new ForceConstraintPlane(normal, intrusion));
    }

    applyAcceleration(acceleration: Vector2) {
        this.constraints.forEach(c => c.applyAcceleration(acceleration));
    }

    applySpeed(speed: Vector2) {
        this.constraints.forEach(c => c.applySpeed(speed));
    }

    reset() {
        this.constraints.splice(0, this.constraints.length);
    }
}