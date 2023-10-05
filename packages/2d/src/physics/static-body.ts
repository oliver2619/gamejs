import { Body, BodyData } from "./body";
import { CollisionMnemento } from "./collision-mnemento";
import { DynamicCircle } from "./dynamic-circle";
import {ForceConstraints} from "./force-constraints";

export interface StaticBodyData extends BodyData {
}

export abstract class StaticBody extends Body {

    protected constructor(data: StaticBodyData) {
        super(data);
    }

    abstract getCollisionWithCircle(circle: DynamicCircle, mnemento: CollisionMnemento): void;

    abstract getStaticForceConstraintForCircle(circle: DynamicCircle, constraints: ForceConstraints): void;
}