import { Box2d } from "@pluto/core";
import { CollisionMnemento } from "./collision-mnemento";
import { DynamicBody, DynamicBodyData } from "./dynamic-body";
import { StaticBody } from "./static-body";

export class CircleRelativeMomentsOfInertia {

    static readonly SOLID_SPHERE = 2 / 5;
    static readonly HOLLOW_SPHERE = 2 / 3;
    static readonly SOLID_CYLINDER = 1 / 2;
    static readonly HOLLOW_CYLINDER = 1;
    static readonly SOLID_CONE = 3 / 10;
    static readonly HOLLOW_CONE = 1 / 2;
}

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
        box.extendByPoint(data.object.position);
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

    getStaticCollision(body: StaticBody, mnemento: CollisionMnemento) {
        body.getCollisionWithCircle(this, mnemento);
    }

    getStaticForceConstraints(body: StaticBody) {
        body.getStaticForceConstraintForCircle(this, this.forceConstraints);
    }
}