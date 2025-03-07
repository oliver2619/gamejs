import { CollisionMnemento } from "./collision-mnemento";
import { DynamicCircle } from "./dynamic-circle";
import { StaticBodyData } from "./static-body";
import { StaticBoxedBody } from "./static-boxed-body";
import { ForceConstraints } from "./force-constraints";
import { Box2d, ReadonlyVector2d } from "@pluto/core";

export interface StaticLineSegmentData extends StaticBodyData {
    p1: ReadonlyVector2d;
    p2: ReadonlyVector2d;
}

export class StaticLineSegment extends StaticBoxedBody {

    readonly p1: ReadonlyVector2d;
    readonly p2: ReadonlyVector2d;
    readonly normal: ReadonlyVector2d;
    readonly tangent: ReadonlyVector2d;
    readonly offset: number;
    readonly length: number;

    constructor(data: Readonly<StaticLineSegmentData>) {
        super(data);
        this.p1 = data.p1.clone();
        this.p2 = data.p2.clone();
        this.tangent = data.p2.getDifference(data.p1).getNormalized();
        this.normal = data.p2.getDifference(data.p1).getNormalizedCrossProduct(1);
        this.offset = data.p1.getDotProduct(this.normal);
        this.length = data.p2.getDistance(data.p1);
        const box = Box2d.empty();
        box.extendByPoint(this.p1);
        box.extendByPoint(this.p2);
        this.postConstruct(box);
    }

    getCollisionWithCircle(circle: DynamicCircle, mnemento: CollisionMnemento) {
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

    getStaticForceConstraintForCircle(circle: DynamicCircle, constraints: ForceConstraints) {
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

    protected onRender(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.moveTo(this.p1.x, -this.p1.y)
        context.lineTo(this.p2.x, -this.p2.y)
    }
}