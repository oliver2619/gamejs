import { Body, BodyData } from "./body";
import { CollisionMnemento } from "./collision-mnemento";
import { DynamicCircle } from "./dynamic-circle";

export interface StaticBodyData extends BodyData {
}

export abstract class StaticBody extends Body {

    constructor(data: StaticBodyData) {
        super(data);
    }

    abstract getCollisionWithCircle(circle: DynamicCircle, mnemento: CollisionMnemento): void;
}