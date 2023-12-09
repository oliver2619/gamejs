import { Body, BodyData } from "./body";
import { CollisionMnemento } from "./collision-mnemento";
import { SimulatedCircle } from "./simulated-circle";
import {ForceConstraints} from "./force-constraints";

export interface StaticBodyData extends BodyData {
}

export abstract class StaticBody extends Body {

    protected constructor(data: StaticBodyData) {
        super(data);
    }

    abstract getCollisionWithCircle(circle: SimulatedCircle, mnemento: CollisionMnemento): void;

    abstract getStaticForceConstraintForCircle(circle: SimulatedCircle, constraints: ForceConstraints): void;
}