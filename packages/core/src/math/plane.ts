import { ReadonlyVector3d, Vector3d } from "./vector-3d";

export class Plane {

    private constructor(public readonly offset: number, public readonly normal: ReadonlyVector3d) { }

    static fromNormal(position: ReadonlyVector3d, normal: ReadonlyVector3d): Plane {
        const n = normal.getNormalized();
        return new Plane(n.getDotProduct(position), n);
    }

    static fromVectors(position: ReadonlyVector3d, u: ReadonlyVector3d, v: ReadonlyVector3d): Plane {
        return Plane.fromNormal(position, u.getCrossProduct(v));
    }

    clone(): Plane {
        return new Plane(this.offset, this.normal.clone());
    }

    getDistance(point: ReadonlyVector3d): number {
        return Math.abs(this.getSignedDistance(point));
    }

    getPosition(): Vector3d {
        return this.normal.getScaled(this.offset);
    }

    getSignedDistance(point: ReadonlyVector3d): number {
        return point.getDotProduct(this.normal) - this.offset;
    }
}
