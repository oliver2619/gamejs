export interface PhysicsMaterialData {
    bounciness?: number;
    friction?: number;
    enabled?: boolean;
}

export class PhysicsMaterial {

    bounciness: number;
    friction: number;
    enabled: boolean;

    constructor(data?: Readonly<PhysicsMaterialData>) {
        this.bounciness = data == undefined || data.bounciness == undefined ? 1 : data.bounciness;
        this.friction = data == undefined || data.friction == undefined ? 1 : data.friction;
        this.enabled = data == undefined || data.enabled == undefined ? true : data.enabled;
    }

    getResultingBounciness(other: PhysicsMaterial): number {
        // TODO check if combination of bounciness is correct
        return this.bounciness * other.bounciness;
    }

    getResultingFriction(other: PhysicsMaterial): number {
        // TODO check if combination of friction is correct
        return this.friction * other.friction;
    }
}