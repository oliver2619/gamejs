import { Box2, ReadonlyVector2 } from "projects/core/src/public-api";
import { CollisionMnemento } from "./collision-mnemento";
import { SimulatedCircle } from "./simulated-circle";
import { StaticBodyData } from "./static-body";
import { StaticBoxedBody } from "./static-boxed-body";
import { ForceConstraints } from "./force-constraints";

export interface StaticCircleData extends StaticBodyData {

    readonly center: ReadonlyVector2;
    readonly radius: number;
}

export class StaticCircle extends StaticBoxedBody {

    readonly center: ReadonlyVector2;
    readonly radius: number;

    constructor(data: StaticCircleData) {
        super(data);
        this.center = data.center.clone();
        this.radius = data.radius;
        const bb = Box2.empty();
        bb.extend(this.center.x, this.center.y);
        bb.extendEveryDirection(this.radius);
        this.postConstruct(bb);
    }

    getCollisionWithCircle(circle: SimulatedCircle, mnemento: CollisionMnemento) {
        const deltaPos = circle.object.position.getDifference(this.center);
        const a = circle.speed.squareLength;
        if (a === 0) {
            return;
        }
        const b = deltaPos.getDotProduct(circle.speed);
        const r = circle.radius + this.radius;
        const c = deltaPos.squareLength - r * r;
        const det = b * b - a * c;
        if (det < 0) {
            return;
        }
        const t = a > 0 ? (-b - Math.sqrt(det)) / a : (-b + Math.sqrt(det)) / a;
        mnemento.add(t, () => {
            const cn = circle.object.position.getDifference(this.center).getNormalized();
            circle.collideAtSurface(cn, this.center.getSumScaled(cn, this.radius), this);
        });
    }

    getStaticForceConstraintForCircle(circle: SimulatedCircle, constraints: ForceConstraints) {
        const deltaPos = circle.object.position.getDifference(this.center);
        const r = circle.radius + this.radius;
        const squareDist = deltaPos.squareLength;
        if (squareDist <= r * r && squareDist > 0) {
            constraints.addPlane(deltaPos.getScaled(1 / Math.sqrt(squareDist)), r - Math.sqrt(squareDist));
        }
    }
}