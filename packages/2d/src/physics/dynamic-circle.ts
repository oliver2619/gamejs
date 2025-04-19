import { Box2d } from "@pluto/core";
import { CollisionMnemento } from "./collision-mnemento";
import { DynamicBody, DynamicBodyData } from "./dynamic-body";
import { StaticBody2d } from "./static-body-2d";

export interface DynamicCircleData extends DynamicBodyData {
    readonly radius: number;
    readonly relativeMomentOfInertia: number;
}

export class DynamicCircle extends DynamicBody {

    readonly radius: number;

    private relativeMomentOfInertia: number;

    get momentOfInertia(): number {
        return this.relativeMomentOfInertia * this.mass * this.radius * this.radius;
    }

    constructor(data: DynamicCircleData) {
        super(data);
        this.radius = data.radius;
        this.relativeMomentOfInertia = data.relativeMomentOfInertia;
        const box = Box2d.empty();
        box.extendByPoint(data.object.coordSystem.position);
        box.extendEveryDirection(data.radius);
        this.postConstruct(box);
    }

    getCollisionWithCircle(circle: DynamicCircle, mnemento: CollisionMnemento): void {
        const deltaPos = circle.position.getDifference(this.position);
        const deltaSpeed = circle.speed.getDifference(this.speed);
        const a = deltaSpeed.squareLength;
        if (a === 0) {
            return;
        }
        const b = deltaPos.getDotProduct(deltaSpeed);
        const r = circle.radius + this.radius;
        const c = deltaPos.squareLength - r * r;
        const det = b * b - a * c;
        if (det < 0) {
            return;
        }
        const t = a > 0 ? (-b - Math.sqrt(det)) / a : (-b + Math.sqrt(det)) / a;
        mnemento.add(t, () => {
            const cn = circle.position.getDifference(this.position).withLength(this.radius);
            this.collideWithOtherAt(this.position.getSum(cn), circle);
        });

    }

    getDynamicCollision(body: DynamicBody, mnemento: CollisionMnemento): void {
        body.getCollisionWithCircle(this, mnemento);
    }

    getStaticCollision(body: StaticBody2d, mnemento: CollisionMnemento) {
        body.getCollisionWithCircle(this, mnemento);
    }

    getStaticForceConstraints(body: StaticBody2d) {
        body.getStaticForceConstraintForCircle(this, this.forceConstraints);
    }
}