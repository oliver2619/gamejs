export interface PhysicsMaterialData {
    readonly bounciness?: number;
    readonly friction?: number;
    readonly enabled?: boolean;
}

export class PhysicsMaterial {

    bounciness: number;
    friction: number;
    enabled: boolean;

    constructor(data?: PhysicsMaterialData) {
        this.bounciness = data == undefined || data.bounciness == undefined ? 1 : data.bounciness;
        this.friction = data == undefined || data.friction == undefined ? 0 : data.friction;
        this.enabled = data == undefined || data.enabled == undefined ? true : data.enabled;
    }
}