import { Box2, ReadonlyVector2 } from "core/src/index";
import { CollisionMnemento } from "./collision-mnemento";
import { DynamicCircle } from "./dynamic-circle";
import { StaticBodyData } from "./static-body";
import { StaticBoxedBody } from "./static-boxed-body";
import {ForceConstraints} from "./force-constraints";

export interface StaticLineSegmentData extends StaticBodyData {
    readonly p1: ReadonlyVector2;
    readonly p2: ReadonlyVector2;
}

export class StaticLineSegment extends StaticBoxedBody {

    readonly p1: ReadonlyVector2;
    readonly p2: ReadonlyVector2;
    readonly normal: ReadonlyVector2;
    readonly offset: number;

    constructor(data: StaticLineSegmentData) {
        super(data);
        this.p1 = data.p1.clone();
        this.p2 = data.p2.clone();
        this.normal = data.p2.getDifference(data.p1).getNormalizedCrossProduct(1);
        this.offset = data.p1.getDotProduct(this.normal);
        const box = Box2.empty();
        box.extendByPoint(this.p1);
        box.extendByPoint(this.p2);
        this.postConstruct(box);
    }

    getCollisionWithCircle(circle: DynamicCircle, mnemento: CollisionMnemento){
        const det = circle.speed.getDotProduct(this.normal);
        if (det === 0) {
            return;
        }
        let t: number;
        if (det > 0) {
            t = (this.offset - circle.radius - circle.object.position.getDotProduct(this.normal)) / det;
        } else {
            t = (this.offset + circle.radius - circle.object.position.getDotProduct(this.normal)) / det;
        }
        mnemento.add(t, () => circle.collideAtSurface(this.normal, this.material));
    }

    getStaticForceConstraintForCircle(circle: DynamicCircle, constraints: ForceConstraints) {
        const signedDistance = circle.object.position.getDotProduct(this.normal) - this.offset;
        if (Math.abs(signedDistance) <= circle.radius) {
            if (signedDistance > 0) {
                constraints.addPlane(this.normal, circle.radius - signedDistance);
            } else {
                constraints.addPlane(this.normal.getScaled(-1), circle.radius + signedDistance);
            }
        }
    }
}