import { Box2, ReadonlyVector2 } from "core/src/index";
import { CollisionMnemento } from "./collision-mnemento";
import { DynamicCircle } from "./dynamic-circle";
import { StaticBodyData } from "./static-body";
import { StaticBoxedBody } from "./static-boxed-body";
import {ForceConstraints} from "./force-constraints";

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

    getCollisionWithCircle(circle: DynamicCircle, mnemento: CollisionMnemento){

    }

    getStaticForceConstraintForCircle(circle: DynamicCircle, constraints: ForceConstraints) {
    }
}