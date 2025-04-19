import { Box3d, EventObservable, Observable, ReadonlyBox2d, ReadonlyBox3d, ReadonlyVector2d, Vector2d, Vector3d } from "@pluto/core";
import { Body2d, Body2dData } from "./body-2d";
import { CollisionMnemento } from "./collision-mnemento";
import { ForceConstraints } from "./force-constraints";
import { StaticBody2d } from "./static-body-2d";
import { Object2dBase } from "../scene";

export interface DynamicBodyPreSimulateEvent {
    readonly body: DynamicBody;
    readonly timeout: number;
}

export interface DynamicBodyData extends Body2dData {
    readonly mass?: number | undefined;
    readonly object: Object2dBase;
    readonly speed?: ReadonlyVector2d | undefined;
    readonly rotationSpeed?: number | undefined;
    readonly gravity?: number | undefined;
}

export abstract class DynamicBody extends Body2d {

    readonly object: Object2dBase;
    readonly speed: Vector2d;
    readonly acceleration = new Vector2d(0, 0);

    abstract readonly momentOfInertia: number;

    mass: number;
    rotationSpeed: number;
    angularAcceleration = 0;
    gravity: number;

    private readonly _onPreSimulate = new EventObservable<DynamicBodyPreSimulateEvent>();
    private readonly _staticBoundingBox = Box3d.empty();
    private readonly _dynamicBoundingBox = Box3d.empty();
    protected readonly forceConstraints = new ForceConstraints();
    private boundingRadius = 0;

    get boundingBox(): ReadonlyBox3d {
        return this._dynamicBoundingBox;
    }

    get onPreSimulate(): Observable<DynamicBodyPreSimulateEvent> {
        return this._onPreSimulate;
    }
    
    get position(): ReadonlyVector2d {
        return this.object.coordSystem.position;
    }

    set position(p: ReadonlyVector2d) {
        this.object.updateCoordSystem(cs => cs.position.setVector(p));
    }

    constructor(data: DynamicBodyData) {
        super(data);
        this.mass = data.mass == undefined ? 1 : data.mass;
        this.gravity = data.gravity == undefined ? 1 : data.gravity;
        this.object = data.object;
        this.speed = data.speed == undefined ? new Vector2d(0, 0) : data.speed.clone();
        this.rotationSpeed = data.rotationSpeed == undefined ? 0 : data.rotationSpeed;
        // this.object.position.onModify.subscribe(() => this.staticBoundingBoxModified = true);
        this.updateDynamicBoundingBox(0);
    }

    applyStaticForceConstraints() {
        this.forceConstraints.applyAcceleration(this.acceleration);
        this.forceConstraints.applySpeed(this.speed);
    }

    collideAtSurface(normal: ReadonlyVector2d, collisionPoint: ReadonlyVector2d, other: Body2d) {
        const tangent = normal.getCrossProductWithScalar(1);
        const bounciness = this.material.getResultingBounciness(other.material);
        const friction = this.material.getResultingFriction(other.material);
        const speedDotNormal = this.speed.getDotProduct(normal);
        const directionToCollisionPoint = collisionPoint.getDifference(this.position);
        const distanceToCollisionPoint = directionToCollisionPoint.normalize();
        const deltaSpeedAlongNormal = speedDotNormal * (-1 - bounciness);
        const rotationToSpeedFactor = - directionToCollisionPoint.getCrossProductWithScalar(1).getDotProduct(tangent) * distanceToCollisionPoint;
        const speedAlongTangent = this.speed.getDotProduct(tangent) + rotationToSpeedFactor * this.rotationSpeed;
        const deltaPulse = Math.abs(deltaSpeedAlongNormal) * friction * (speedAlongTangent > 0 ? -1 : 1);
        const deltaRotation = (this.mass / this.momentOfInertia) * deltaPulse * directionToCollisionPoint.getCrossProductWithVector(tangent) * distanceToCollisionPoint;
        this.speed.addScaled(normal, deltaSpeedAlongNormal);
        if (speedAlongTangent * (speedAlongTangent + deltaPulse + deltaRotation * rotationToSpeedFactor) < 0) {
            const k = - speedAlongTangent / (deltaPulse + deltaRotation * rotationToSpeedFactor);
            this.speed.addScaled(tangent, deltaPulse * k);
            this.rotationSpeed += deltaRotation * k;
        } else {
            this.speed.addScaled(tangent, deltaPulse);
            this.rotationSpeed += deltaRotation;
        }
        this.onCollision.next({ body1: this, body2: other });
    }

    collideWithOtherAt(_position: ReadonlyVector2d, other: DynamicBody) {
        const deltaSpeed = other.speed.getDifference(this.speed);
        // const directionToCollisionPointThis = position.getDifference(this.position);
        // const directionToCollisionPointOther = position.getDifference(other.position);
        // const speedAtPositionThis = this.speed.getSum(directionToCollisionPointThis.getCrossProductWithScalar(-this.rotationSpeed));
        // const speedAtPositionOther = other.speed.getSum(directionToCollisionPointOther.getCrossProductWithScalar(-other.rotationSpeed));
        // TODO this is not correct at all:
        this.speed.add(deltaSpeed);
        other.speed.subtract(deltaSpeed);
        // -- end
        this.onCollision.next({ body1: this, body2: other });
    }

    abstract getCollisionWithCircle(circle: any, mnemento: CollisionMnemento): void;

    abstract getDynamicCollision(body: DynamicBody, mnemento: CollisionMnemento): void;

    abstract getStaticCollision(body: StaticBody2d, mnemento: CollisionMnemento): void;

    abstract getStaticForceConstraints(body: StaticBody2d): void;

    presimulate(globalAcceleration: ReadonlyVector2d, timeout: number) {
        if (this.enabled) {
            this.forceConstraints.reset();
            this.acceleration.setScaled(globalAcceleration, this.gravity);
            this.angularAcceleration = 0;
            this._onPreSimulate.next({ body: this, timeout });
        }
    }

    simulateSpeed(timeout: number) {
        this.speed.addScaled(this.acceleration, timeout);
        this.rotationSpeed += this.angularAcceleration * timeout;
    }

    simulatePosition(timeout: number) {
        this.object.updateCoordSystem(cs => {
            cs.position.addScaled(this.speed, timeout);
            cs.rotate(this.rotationSpeed * timeout);
        });
    }

    updateDynamicBoundingBox(timeout: number) {
        this._staticBoundingBox.setCenter(new Vector3d(this.position.x, this.position.y, this.z), new Vector3d(this.boundingRadius, this.boundingRadius, this.zDepth));
        const dir = this.speed.getScaled(timeout);
        this._dynamicBoundingBox.setBoundingBox(this._staticBoundingBox);
        this._dynamicBoundingBox.extendByDirection(new Vector3d(dir.x, dir.y, 0));
    }

    protected postConstruct(boundingBox: ReadonlyBox2d) {
        this.boundingRadius = boundingBox.size.length;
    }
}