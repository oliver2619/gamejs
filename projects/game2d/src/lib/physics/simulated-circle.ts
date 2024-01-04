import { Box2 } from "core";
import { CollisionMnemento } from "./collision-mnemento";
import { DynamicBodyData } from "./dynamic-body";
import { SimulatedBody } from "./simulated-body";
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

export class SimulatedCircle extends SimulatedBody {

    readonly radius: number;

    private relativeMomentOfInertia: number;

    get momentOfInertia(): number {
        return this.relativeMomentOfInertia * this.mass * this.radius * this.radius;
    }

    constructor(data: DynamicCircleData) {
        super(data);
        this.radius = data.radius;
        this.relativeMomentOfInertia = data.relativeMomentOfInertia;
        const box = Box2.empty();
        box.extendByPoint(data.object.position);
        box.extendEveryDirection(data.radius);
        this.postConstruct(box);
    }

    getStaticCollision(body: StaticBody, mnemento: CollisionMnemento) {
        body.getCollisionWithCircle(this, mnemento);
    }

    getStaticForceConstraints(body: StaticBody) {
        body.getStaticForceConstraintForCircle(this, this.forceConstraints);
    }
}