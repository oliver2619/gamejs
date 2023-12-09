import { EventObservable, ReadonlyVector2 } from "projects/core/src/public-api";
import { Body } from "./body";
import { CollisionMnemento } from "./collision-mnemento";
import { DynamicBody, DynamicBodyData } from "./dynamic-body";
import { ForceConstraints } from "./force-constraints";
import { StaticBody } from "./static-body";

export interface SimulatedBodyPreSimulateEvent {
    readonly body: DynamicBody;
    readonly timeout: number;
}

export interface SimulatedBodyData extends DynamicBodyData {

    readonly mass?: number;
}

export abstract class SimulatedBody extends DynamicBody {

    readonly onPreSimulate = new EventObservable<SimulatedBodyPreSimulateEvent>();

    abstract readonly momentOfInertia: number;

    mass: number;

    protected readonly forceConstraints = new ForceConstraints();

    constructor(data: SimulatedBodyData) {
        super(data);
        this.mass = data.mass == undefined ? 1 : data.mass;
    }

    applyStaticForceConstraints() {
        this.forceConstraints.applyAcceleration(this.acceleration);
        this.forceConstraints.applySpeed(this.speed);
    }

    collideAtSurface(normal: ReadonlyVector2, collisionPoint: ReadonlyVector2, other: Body) {
        const tangent = normal.getCrossProductWithScalar(1);
        const bounciness = this.material.getResultingBounciness(other.material);
        const friction = this.material.getResultingFriction(other.material);
        const speedDotNormal = this.speed.getDotProduct(normal);
        const directionToCollisionPoint = collisionPoint.getDifference(this.object.position);
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
        this.onCollision.produce({
            body1: this,
            body2: other
        });
    }

    abstract getStaticCollision(body: StaticBody, mnemento: CollisionMnemento): void;

    abstract getStaticForceConstraints(body: StaticBody): void;

    resetForcesAndConstraints(globalAcceleration: ReadonlyVector2) {
        this.forceConstraints.reset();
        this.acceleration.setScaled(globalAcceleration, this.mass);
        this.angularAcceleration = 0;
    }
}