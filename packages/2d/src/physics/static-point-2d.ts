import { CollisionMnemento } from "./collision-mnemento";
import { DynamicCircle } from "./dynamic-circle";
import { StaticBody2dData } from "./static-body-2d";
import { ForceConstraints } from "./force-constraints";
import { Box2d, ReadonlyVector2d } from "@pluto/core";
import { StaticBoxedBody2d } from "./static-boxed-body-2d";

export interface StaticPoint2dData extends StaticBody2dData {
    position: ReadonlyVector2d;
}

export class StaticPoint2d extends StaticBoxedBody2d {

    readonly position: ReadonlyVector2d;

    constructor(data: Readonly<StaticPoint2dData>) {
        super(data);
        this.position = data.position.clone();
        const bb = Box2d.empty();
        bb.extend(this.position.x, this.position.y);
        this.postConstruct(bb);
    }

    getCollisionWithCircle(circle: DynamicCircle, mnemento: CollisionMnemento) {
        const deltaPos = circle.object.coordSystem.position.getDifference(this.position);
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
        mnemento.add(t, () => circle.collideAtSurface(circle.object.coordSystem.position.getDifference(this.position).getNormalized(), this.position, this));
    }

    getStaticForceConstraintForCircle(circle: DynamicCircle, constraints: ForceConstraints) {
        const deltaPos = circle.object.coordSystem.position.getDifference(this.position);
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