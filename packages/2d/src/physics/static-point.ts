import { ReadonlyVector2, ReadonlyVector3, Vector3 } from "core/src/index";
import { CollisionMnemento } from "./collision-mnemento";
import { DynamicCircle } from "./dynamic-circle";
import { StaticBody, StaticBodyData } from "./static-body";
import {ForceConstraints} from "./force-constraints";

export interface StaticPointData extends StaticBodyData {

    readonly position: ReadonlyVector2;
}

export class StaticPoint extends StaticBody {

    readonly position: ReadonlyVector2;

    get pointIn3d(): ReadonlyVector3 {
        return new Vector3(this.position.x, this.position.y, this.z);
    }

    constructor(data: StaticPointData) {
        super(data);
        this.position = data.position.clone();
    }

    getCollisionWithCircle(circle: DynamicCircle, mnemento: CollisionMnemento) {

    }

    getStaticForceConstraintForCircle(circle: DynamicCircle, constraints: ForceConstraints) {
    }
}