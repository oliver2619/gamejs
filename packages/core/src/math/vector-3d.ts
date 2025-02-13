export interface ReadonlyVector3d {
    readonly x: number;
    readonly y: number;
    readonly z: number;

    clone(): Vector3d;

    dot(other: ReadonlyVector3d): number;

    normalized(): Vector3d;
}

export class Vector3d implements ReadonlyVector3d {

    constructor(public x: number, public y: number, public z: number) { }

    clone(): Vector3d {
        return new Vector3d(this.x, this.y, this.z);
    }

    dot(other: ReadonlyVector3d): number {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    normalize() {
        const l = this.x * this.x + this.y * this.y + this.z * this.z;
        if (l > 0) {
            const f = 1 / Math.sqrt(l);
            this.x *= f;
            this.y *= f;
            this.z *= f;
        }
    }

    normalized(): Vector3d {
        const l = this.x * this.x + this.y * this.y + this.z * this.z;
        if (l > 0) {
            const f = 1 / Math.sqrt(l);
            return new Vector3d(this.x * f, this.y * f, this.z * f);
        } else {
            return new Vector3d(0, 0, 0);
        }
    }

    set(x: number, y: number, z: number): void;
    set(v: ReadonlyVector3d): void;
    set(...args: any[]) {
        if (typeof args[0] === 'number') {
            this.x = args[0];
            this.y = args[1];
            this.z = args[2];
        } else {
            this.x = args[0].x;
            this.y = args[0].y;
            this.z = args[0].z;
        }
    }
}