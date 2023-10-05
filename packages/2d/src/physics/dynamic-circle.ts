import { Box2 } from "core/src/index";
import { CollisionMnemento } from "./collision-mnemento";
import { DynamicBody, DynamicBodyData } from "./dynamic-body";
import { StaticBody } from "./static-body";

export interface DynamicCircleData extends DynamicBodyData {

    readonly radius: number;
}

export class DynamicCircle extends DynamicBody {

    readonly radius: number;

    constructor(data: DynamicCircleData) {
        super(data);
        this.radius = data.radius;
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