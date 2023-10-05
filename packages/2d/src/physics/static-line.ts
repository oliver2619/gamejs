import {ReadonlyVector2} from "core/src/index";
import {CollisionMnemento} from "./collision-mnemento";
import {DynamicCircle} from "./dynamic-circle";
import {StaticBody, StaticBodyData} from "./static-body";
import {ForceConstraints} from "./force-constraints";

export interface StaticLineData extends StaticBodyData {

    readonly point: ReadonlyVector2;
    readonly normal: ReadonlyVector2;
}

export class StaticLine extends StaticBody {

    readonly offset: number;
    readonly normal: ReadonlyVector2;

    constructor(data: StaticLineData) {
        super(data);
        this.normal = data.normal.getNormalized();
        this.offset = data.point.getDotProduct(this.normal);
    }

    getCollisionWithCircle(circle: DynamicCircle, mnemento: CollisionMnemento) {
        const speedDotProduct = circle.speed.getDotProduct(this.normal);
        if (speedDotProduct === 0) {
            return;
        }
        const positionDotProduct = circle.object.position.getDotProduct(this.normal) - this.offset;
        let t: number;
        if (speedDotProduct > 0) {
            t = (-circle.radius - positionDotProduct) / speedDotProduct;
        } else {
            t = (circle.radius - positionDotProduct) / speedDotProduct;
        }
        mnemento.add(t, () => circle.collideAtSurface(this.normal, circle.object.position.getSumScaled(this.normal, -positionDotProduct * circle.radius), this.material));
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