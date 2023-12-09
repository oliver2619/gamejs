import { Box2, ReadonlyVector2 } from "projects/core/src/public-api";
import { CollisionMnemento } from "./collision-mnemento";
import { SimulatedCircle } from "./simulated-circle";
import { StaticBodyData } from "./static-body";
import { StaticBoxedBody } from "./static-boxed-body";
import { ForceConstraints } from "./force-constraints";

export interface StaticLineSegmentData extends StaticBodyData {
    readonly p1: ReadonlyVector2;
    readonly p2: ReadonlyVector2;
}

export class StaticLineSegment extends StaticBoxedBody {

    readonly p1: ReadonlyVector2;
    readonly p2: ReadonlyVector2;
    readonly normal: ReadonlyVector2;
    readonly tangent: ReadonlyVector2;
    readonly offset: number;
    readonly length: number;

    constructor(data: StaticLineSegmentData) {
        super(data);
        this.p1 = data.p1.clone();
        this.p2 = data.p2.clone();
        this.tangent = data.p2.getDifference(data.p1).getNormalized();
        this.normal = data.p2.getDifference(data.p1).getNormalizedCrossProduct(1);
        this.offset = data.p1.getDotProduct(this.normal);
        this.length = data.p2.getDistance(data.p1);
        const box = Box2.empty();
        box.extendByPoint(this.p1);
        box.extendByPoint(this.p2);
        this.postConstruct(box);
    }

    getCollisionWithCircle(circle: SimulatedCircle, mnemento: CollisionMnemento) {
        const speedDotProduct = circle.speed.getDotProduct(this.normal);
        if (speedDotProduct === 0) {
            return;
        }
        const signedDistance = circle.object.position.getDotProduct(this.normal) - this.offset;
        let t: number;
        if (speedDotProduct > 0) {
            t = (-circle.radius - signedDistance) / speedDotProduct;
        } else {
            t = (circle.radius - signedDistance) / speedDotProduct;
        }
        const tangentOffset = circle.object.position.getDifference(this.p1).getSumScaled(circle.speed, t).getDotProduct(this.tangent);
        if (tangentOffset >= 0 && tangentOffset <= this.length) {
            mnemento.add(t, () => circle.collideAtSurface(this.normal, circle.object.position.getSumScaled(this.normal, -signedDistance), this));
        }
    }

    getStaticForceConstraintForCircle(circle: SimulatedCircle, constraints: ForceConstraints) {
        const signedDistance = circle.object.position.getDotProduct(this.normal) - this.offset;
        const tangentOffset = circle.object.position.getDifference(this.p1).getDotProduct(this.tangent);
        if (Math.abs(signedDistance) <= circle.radius && tangentOffset >= 0 && tangentOffset <= this.length) {
            if (signedDistance > 0) {
                constraints.addPlane(this.normal, circle.radius - signedDistance);
            } else {
                constraints.addPlane(this.normal.getScaled(-1), circle.radius + signedDistance);
            }
        }
    }
}