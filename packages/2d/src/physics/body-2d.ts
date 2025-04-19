import { EventObservable } from "@pluto/core";
import { PhysicsMaterial } from "./physics-material";

export interface Body2dCollisionEvent {
    readonly body1: Body2d;
    readonly body2: Body2d;
}

export interface Body2dData {
    enabled?: boolean | undefined;
    material?: PhysicsMaterial | undefined;
    z?: number | undefined;
    zDepth?: number | undefined;
}

export abstract class Body2d {

    readonly onCollision = new EventObservable<Body2dCollisionEvent>();

    material: PhysicsMaterial;
    enabled: boolean;
    z: number;
    zDepth: number;

    constructor(data: Readonly<Body2dData>) {
        this.material = data.material == undefined ? new PhysicsMaterial() : data.material;
        this.enabled = data.enabled == undefined ? true : data.enabled;
        this.z = data.z == undefined ? 0 : data.z;
        this.zDepth = data.zDepth == undefined ? 1 : data.zDepth;
    }

    overlapsZRange(other: Body2d): boolean {
        return Math.abs(this.z - other.z) <= (this.zDepth + other.zDepth) * 0.5;
        // return this.z <= other.z + other.zDepth && this.z + this.zDepth >= other.z;
    }
}