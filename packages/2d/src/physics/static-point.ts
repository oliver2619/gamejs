import { CollisionMnemento } from "./collision-mnemento";
import { DynamicCircle } from "./dynamic-circle";
import { StaticBody, StaticBodyData } from "./static-body";
import { ForceConstraints } from "./force-constraints";
import { ReadonlyVector2d, ReadonlyVector3d, Vector3d } from "core";

export interface StaticPointData extends StaticBodyData {
    position: ReadonlyVector2d;
}

export class StaticPoint extends StaticBody {

    readonly position: ReadonlyVector2d;

    get pointIn3d(): ReadonlyVector3d {
        return new Vector3d(this.position.x, this.position.y, this.z);
    }

    constructor(data: Readonly<StaticPointData>) {
        super(data);
        this.position = data.position.clone();
    }

    getCollisionWithCircle(circle: DynamicCircle, mnemento: CollisionMnemento) {
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

    getStaticForceConstraintForCircle(circle: DynamicCircle, constraints: ForceConstraints) {
        const deltaPos = circle.object.position.getDifference(this.position);
        const squareDist = deltaPos.squareLength;
        if (squareDist <= circle.radius * circle.radius && squareDist > 0) {
            constraints.addPlane(deltaPos.getScaled(1 / Math.sqrt(squareDist)), circle.radius - Math.sqrt(squareDist));
        }
    }

    protected onRender(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.moveTo(this.position.x - 3, -this.position.y - 3);
        context.lineTo(this.position.x + 3, -this.position.y + 3);
        context.moveTo(this.position.x - 3, -this.position.y + 3);
        context.lineTo(this.position.x + 3, -this.position.y - 3);
    }
}