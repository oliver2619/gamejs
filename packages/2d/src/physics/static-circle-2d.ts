import { CollisionMnemento } from "./collision-mnemento";
import { DynamicCircle } from "./dynamic-circle";
import { StaticBody2dData } from "./static-body-2d";
import { StaticBoxedBody2d } from "./static-boxed-body-2d";
import { ForceConstraints } from "./force-constraints";
import { Box2d, ReadonlyVector2d } from "@pluto/core";

export interface StaticCircle2dData extends StaticBody2dData {
    center: ReadonlyVector2d;
    radius: number;
}

export class StaticCircle2d extends StaticBoxedBody2d {

    readonly center: ReadonlyVector2d;
    readonly radius: number;

    constructor(data: Readonly<StaticCircle2dData>) {
        super(data);
        this.center = data.center.clone();
        this.radius = data.radius;
        const bb = Box2d.empty();
        bb.extend(this.center.x, this.center.y);
        bb.extendEveryDirection(this.radius);
        this.postConstruct(bb);
    }

    getCollisionWithCircle(circle: DynamicCircle, mnemento: CollisionMnemento) {
        const deltaPos = circle.object.coordSystem.position.getDifference(this.center);
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
            const cn = circle.object.coordSystem.position.getDifference(this.center).getNormalized();
            circle.collideAtSurface(cn, this.center.getSumScaled(cn, this.radius), this);
        });
    }

    getStaticForceConstraintForCircle(circle: DynamicCircle, constraints: ForceConstraints) {
        const deltaPos = circle.object.coordSystem.position.getDifference(this.center);
        const r = circle.radius + this.radius;
        const squareDist = deltaPos.squareLength;
        if (squareDist <= r * r && squareDist > 0) {
            constraints.addPlane(deltaPos.getScaled(1 / Math.sqrt(squareDist)), r - Math.sqrt(squareDist));
        }
    }

    protected onRender(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.ellipse(this.center.x, -this.center.y, this.radius, this.radius, 0, 0, Math.PI * 2);
    }
}