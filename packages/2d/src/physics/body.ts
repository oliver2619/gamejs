import { EventObservable } from "@pluto/core";
import { PhysicsMaterial } from "./physics-material";

export interface BodyCollisionEvent {
    readonly body1: Body;
    readonly body2: Body;
}

export interface BodyData {
    enabled?: boolean;
    material?: PhysicsMaterial;
    z?: number;
    zDepth?: number;
}

export abstract class Body {

    readonly onCollision = new EventObservable<BodyCollisionEvent>();

    material: PhysicsMaterial;
    enabled: boolean;

    z: number;
    zDepth: number;

    constructor(data: Readonly<BodyData>) {
        this.material = data.material == undefined ? new PhysicsMaterial() : data.material;
        this.enabled = data.enabled == undefined ? true : data.enabled;
        this.z = data.z == undefined ? 0 : data.z;
        this.zDepth = data.zDepth == undefined ? 1 : data.zDepth;
    }

    overlapsZRange(other: Body): boolean {
        return this.z <= other.z + other.zDepth && this.z + this.zDepth >= other.z;
    }
}