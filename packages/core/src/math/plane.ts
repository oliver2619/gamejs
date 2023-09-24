import { ReadonlyVector3, Vector3 } from "./vector3";

export class Plane {

    get offsetPosition(): Vector3 {
        return this.normal.getScaled(this.offset);
    }

    private constructor(public readonly offset: number, public readonly normal: ReadonlyVector3) { }

    static fromNormal(offset: ReadonlyVector3, normal: ReadonlyVector3): Plane {
        const n = normal.getNormalized();
        return new Plane(n.getDotProduct(offset), n);
    }

    static fromVectors(offset: ReadonlyVector3, v1: ReadonlyVector3, v2: ReadonlyVector3): Plane {
        return Plane.fromNormal(offset, v1.getCrossProduct(v2));
    }

    clone(): Plane {
        return new Plane(this.offset, this.normal.clone());
    }

    getDistance(point: ReadonlyVector3): number {
        return Math.abs(this.getSignedDistance(point));
    }

    getSignedDistance(point: ReadonlyVector3): number {
        return point.getDotProduct(this.normal) - this.offset;
    }
}
