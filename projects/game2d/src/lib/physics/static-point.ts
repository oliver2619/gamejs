import { ReadonlyVector2, ReadonlyVector3, Vector3 } from "projects/core/src/public-api";
import { CollisionMnemento } from "./collision-mnemento";
import { SimulatedCircle } from "./simulated-circle";
import { StaticBody, StaticBodyData } from "./static-body";
import { ForceConstraints } from "./force-constraints";

export interface StaticPointData extends StaticBodyData {

    readonly position: ReadonlyVector2;
}

export class StaticPoint extends StaticBody {

    readonly position: ReadonlyVector2;

    get pointIn3d(): ReadonlyVector3 {
        return new Vector3(this.position.x, this.position.y, this.z);
    }

    constructor(data: StaticPointData) {
        super(data);
        this.position = data.position.clone();
    }

    getCollisionWithCircle(circle: SimulatedCircle, mnemento: CollisionMnemento) {
        const deltaPos = circle.object.position.getDifference(this.position);
        const a = circle.speed.squareLength;
        if (a === 0) {
            return;
        }
        const b = deltaPos.getDotProduct(circle.speed);
        const c = deltaPos.squareLength - circle.radius * circle.radius;
        const det = b * b - a * c;
        if (det < 0) {
            return;
        }
        const t = a > 0 ? (-b - Math.sqrt(det)) / a : (-b + Math.sqrt(det)) / a;
        mnemento.add(t, () => circle.collideAtSurface(circle.object.position.getDifference(this.position).getNormalized(), this.position, this));
    }

    getStaticForceConstraintForCircle(circle: SimulatedCircle, constraints: ForceConstraints) {
        const deltaPos = circle.object.position.getDifference(this.position);
        const squareDist = deltaPos.squareLength;
        if (squareDist <= circle.radius * circle.radius && squareDist > 0) {
            constraints.addPlane(deltaPos.getScaled(1 / Math.sqrt(squareDist)), circle.radius - Math.sqrt(squareDist));
        }
    }
}