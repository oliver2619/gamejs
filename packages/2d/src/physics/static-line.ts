import { ReadonlyVector2 } from "core/src/index";
import { CollisionMnemento } from "./collision-mnemento";
import { DynamicCircle } from "./dynamic-circle";
import { StaticBody, StaticBodyData } from "./static-body";

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
}