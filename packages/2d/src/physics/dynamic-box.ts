import { CollisionMnemento } from "./collision-mnemento";
import { DynamicBody, DynamicBodyData } from "./dynamic-body";
import { StaticBody2d } from "./static-body-2d";

export interface DynamicBoxData extends DynamicBodyData {
    width: number;
    height: number;
}

export class DynamicBox extends DynamicBody {

    readonly width: number;
    readonly height: number;
    private readonly relativeMomentOfInertia: number;

    get momentOfInertia(): number {
        return this.mass * this.relativeMomentOfInertia;
    }

    constructor(data: Readonly<DynamicBoxData>) {
        super(data);
        this.width = data.width;
        this.height = data.height;
        this.relativeMomentOfInertia = (this.width * this.width + this.height * this.height) / 12;
    }

    getCollisionWithCircle(_circle: any, _mnemento: CollisionMnemento): void {
    }

    getDynamicCollision(_body: DynamicBody, _mnemento: CollisionMnemento): void {
    }

    getStaticCollision(_body: StaticBody2d, _mnemento: CollisionMnemento): void {
    }

    getStaticForceConstraints(_body: StaticBody2d): void {
    }
}