import { Box3, CoordSystem2, ReadonlyBox2, ReadonlyBox3, ReadonlyVector2, Vector2, Vector3 } from "core";
import { Body, BodyData } from "./body";

export interface DynamicBodyData extends BodyData {

    readonly object: CoordSystem2;
    readonly speed?: ReadonlyVector2;
    readonly rotationSpeed?: number;
}

export abstract class DynamicBody extends Body {

    readonly object: CoordSystem2;
    readonly speed: Vector2;
    readonly acceleration = new Vector2(0, 0);

    rotationSpeed: number;
    angularAcceleration = 0;

    private readonly _staticBoundingBox = Box3.empty();
    private boundingRadius = 0;

    get staticBoundingBox(): ReadonlyBox3 {
        return this._staticBoundingBox;
    }

    constructor(data: DynamicBodyData) {
        super(data);
        this.object = data.object;
        this.speed = data.speed == undefined ? new Vector2(0, 0) : data.speed.clone();
        this.rotationSpeed = data.rotationSpeed == undefined ? 0 : data.rotationSpeed;
        this.object.position.onModify.subscribe(() => {
            this.updateStaticBoundingBox();
        });
    }

    getDynamicBoundingBox(timeout: number): ReadonlyBox3 {
        const dir = this.speed.getScaled(timeout);
        return this.staticBoundingBox.getExtendedByDirection(new Vector3(dir.x, dir.y, 0));
    }

    simulateSpeed(timeout: number) {
        this.speed.addScaled(this.acceleration, timeout);
        this.rotationSpeed += this.angularAcceleration * timeout;
    }

    simulatePosition(timeout: number) {
        this.object.position.addScaled(this.speed, timeout);
        this.object.rotate(this.rotationSpeed * timeout);
    }

    protected postConstruct(boundingBox: ReadonlyBox2) {
        this.boundingRadius = Math.max(boundingBox.size.x, boundingBox.size.y);
        this.updateStaticBoundingBox();
    }

    private updateStaticBoundingBox() {
        this._staticBoundingBox.clear();
        this._staticBoundingBox.extend(this.object.position.x - this.boundingRadius, this.object.position.y - this.boundingRadius, this.z);
        this._staticBoundingBox.extend(this.object.position.x + this.boundingRadius, this.object.position.y + this.boundingRadius, this.z + this.zDepth);
    }
}