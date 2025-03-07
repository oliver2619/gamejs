import { CollisionMnemento } from "./collision-mnemento";
import { DynamicCircle } from "./dynamic-circle";
import { StaticBody, StaticBodyData } from "./static-body";
import { ForceConstraints } from "./force-constraints";
import { ReadonlyVector2d } from "@pluto/core";

export interface StaticLineData extends StaticBodyData {
    point: ReadonlyVector2d;
    normal: ReadonlyVector2d;
}

export class StaticLine extends StaticBody {

    readonly offset: number;
    readonly normal: ReadonlyVector2d;

    constructor(data: Readonly<StaticLineData>) {
        super(data);
        this.normal = data.normal.getNormalized();
        this.offset = data.point.getDotProduct(this.normal);
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
        mnemento.add(t, () => circle.collideAtSurface(this.normal, circle.object.position.getSumScaled(this.normal, -signedDistance), this));
    }

    getStaticForceConstraintForCircle(circle: DynamicCircle, constraints: ForceConstraints) {
        const signedDistance = circle.object.position.getDotProduct(this.normal) - this.offset;
        if (Math.abs(signedDistance) <= circle.radius) {
            if (signedDistance > 0) {
                constraints.addPlane(this.normal, circle.radius - signedDistance);
            } else {
                constraints.addPlane(this.normal.getScaled(-1), circle.radius + signedDistance);
            }
        }
    }

    protected onRender(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.moveTo(this.offset * this.normal.x - this.normal.y * 1000, -this.offset * this.normal.y - this.normal.x * 1000);
        context.lineTo(this.offset * this.normal.x + this.normal.y * 1000, -this.offset * this.normal.y + this.normal.x * 1000);
    }
}