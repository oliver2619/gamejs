import { Box2, ReadonlyVector2 } from "core/src/index";
import { CollisionMnemento } from "./collision-mnemento";
import { DynamicCircle } from "./dynamic-circle";
import { StaticBodyData } from "./static-body";
import { StaticBoxedBody } from "./static-boxed-body";

export interface StaticLineSegmentData extends StaticBodyData {
    readonly p1: ReadonlyVector2;
    readonly p2: ReadonlyVector2;
}

export class StaticLineSegment extends StaticBoxedBody {

    readonly p1: ReadonlyVector2;
    readonly p2: ReadonlyVector2;
    readonly normal: ReadonlyVector2;

    constructor(data: StaticLineSegmentData) {
        super(data);
        this.p1 = data.p1.clone();
        this.p2 = data.p2.clone();
        this.normal = data.p2.getDifference(data.p1).getNormalizedCrossProduct(1);
        const box = Box2.empty();
        box.extendByPoint(this.p1);
        box.extendByPoint(this.p2);
        this.postConstruct(box);
    }

    getCollisionWithCircle(circle: DynamicCircle, mnemento: CollisionMnemento){
        
    }
}