import { Box3, CoordSystem2, ReadonlyBox2, ReadonlyBox3, ReadonlyVector2, Vector2, Vector3 } from "core/src/index";
import { Body, BodyData } from "./body";
import { CollisionMnemento } from "./collision-mnemento";
import { PhysicsMaterial } from "./physics-material";
import { StaticBody } from "./static-body";

export interface DynamicBodyData extends BodyData {

    readonly object: CoordSystem2;
    readonly mass?: number;
    readonly momentOfInertia?: number;
    readonly speed?: ReadonlyVector2;
}

export abstract class DynamicBody extends Body {

    readonly object: CoordSystem2;
    readonly speed: Vector2;
    readonly acceleration = new Vector2(0, 0);

    rotationSpeed = 0;
    angularAcceleration = 0;
    mass: number;
    momentOfInertia: number;

    private readonly _staticBoundingBox: Box3 = Box3.empty();

    get staticBoundingBox(): ReadonlyBox3 {
        return this._staticBoundingBox;
    }

    constructor(data: DynamicBodyData) {
        super(data);
        this.object = data.object;
        this.speed = data.speed == undefined ? new Vector2(0, 0) : data.speed.clone();
        this.mass = data.mass == undefined ? 1 : data.mass;
        this.momentOfInertia = data.momentOfInertia == undefined ? 1 : data.momentOfInertia;
    }

    // TODO include rotation & spin & friction...
    collideAtSurface(normal: ReadonlyVector2, mat: PhysicsMaterial) {
        // TODO check if combination of bounciness is correct
        const bounciness = this.material.bounciness * mat.bounciness;
        const ref = this.speed.getProjected(normal);
        this.speed.addScaled(ref, -1 - bounciness);
    }

    abstract getStaticCollision(body: StaticBody, mnemento: CollisionMnemento): void;

    getDynamicBoundingBox(timeout: number): ReadonlyBox3 {
        const dir = this.speed.getScaled(timeout);
        return this.staticBoundingBox.getExtendedByDirection(new Vector3(dir.x, dir.y, 0));
    }

    resetForcesAndConstraints(globalAcceleration: ReadonlyVector2) {
        this.acceleration.setScaled(globalAcceleration, this.mass);
        this.angularAcceleration = 0;
    }

    simulateSpeed(timeout: number) {
        this.speed.addScaled(this.acceleration, timeout);
        this.rotationSpeed += this.angularAcceleration * timeout;
    }

    simulate(timeout: number) {
        this.object.position.addScaled(this.speed, timeout);
        this.object.rotate(this.rotationSpeed * timeout);
    }

    protected postConstruct(boundingBox: ReadonlyBox2) {
        if (boundingBox.minimum != undefined && boundingBox.maximum != undefined) {
            this._staticBoundingBox.extend(boundingBox.minimum.x, boundingBox.minimum.y, this.z);
            this._staticBoundingBox.extend(boundingBox.maximum.x, boundingBox.maximum.y, this.z + this.zDepth);
        }
    }
}