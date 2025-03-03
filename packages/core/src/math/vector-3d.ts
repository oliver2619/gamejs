import { Vector2d } from "./vector-2d";

export interface ReadonlyVector3d {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    readonly isZero: boolean;
    readonly length: number;
    readonly squareLength: number;
    clone(): Vector3d;
    equals(v: ReadonlyVector3d): boolean;
    getCrossProduct(v: ReadonlyVector3d): Vector3d;
    getDifference(v: ReadonlyVector3d): Vector3d;
    getDirectionFrom(v: ReadonlyVector3d): Vector3d;
    getDistance(v: ReadonlyVector3d): number;
    getDotProduct(v: ReadonlyVector3d): number;
    getInterpolated(v: ReadonlyVector3d, f: number): Vector3d;
    getNormal(): Vector3d;
    getNormalized(): Vector3d;
    getNormalizedCrossProduct(v: ReadonlyVector3d): Vector3d;
    getProjected(v: ReadonlyVector3d): Vector3d;
    getRotated(axis: ReadonlyVector3d): Vector3d;
    getScaled(f: number): Vector3d;
    getSum(v: ReadonlyVector3d): Vector3d;
    getSumScaled(v: ReadonlyVector3d, f: number): Vector3d;
    getXY(): Vector2d;
    getXZ(): Vector2d;
    getYZ(): Vector2d;
    toString(): string;
    withLength(len: number): Vector3d;
}

export class Vector3d implements ReadonlyVector3d {

    get isZero(): boolean {
        return this.x === 0 && this.y === 0 && this.z === 0;
    }

    get length(): number {
        return Math.sqrt(this.squareLength);
    }

    set length(l: number) {
        let ls = this.squareLength;
        if (ls > 0) {
            const f = l / Math.sqrt(ls);
            this.x *= f;
            this.y *= f;
            this.z *= f;
        }
    }

    get squareLength(): number {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    constructor(public x: number, public y: number, public z: number) { }

    static Zero(): Vector3d {
        return new Vector3d(0, 0, 0);
    }

    add(v: ReadonlyVector3d) {
        if (!v.isZero) {
            this.x += v.x;
            this.y += v.y;
            this.z += v.z;
        }
    }

    addScaled(v: ReadonlyVector3d, f: number) {
        if (!v.isZero && f !== 0) {
            this.x += v.x * f;
            this.y += v.y * f;
            this.z += v.z * f;
        }
    }

    clone(): Vector3d {
        return new Vector3d(this.x, this.y, this.z);
    }

    equals(v: ReadonlyVector3d): boolean {
        return this.x === v.x && this.y === v.y && this.z === v.z;
    }

    getCrossProduct(v: ReadonlyVector3d): Vector3d {
        return new Vector3d(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x);
    }

    getDifference(v: ReadonlyVector3d): Vector3d {
        return new Vector3d(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    getDirectionFrom(v: ReadonlyVector3d): Vector3d {
        const x = this.x - v.x;
        const y = this.y - v.y;
        const z = this.z - v.z;
        let l = x * x + y * y + z * z;
        if (l > 0) {
            l = 1 / Math.sqrt(l);
            return new Vector3d(x * l, y * l, z * l);
        } else {
            return new Vector3d(x, y, z);
        }
    }

    getDistance(v: ReadonlyVector3d): number {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    getDotProduct(v: ReadonlyVector3d): number {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    getInterpolated(v: ReadonlyVector3d, f: number): Vector3d {
        const g = 1 - f;
        return new Vector3d(this.x * g + v.x * f, this.y * g + v.y * f, this.z * g + v.z * f);
    }

    getNormal(): Vector3d {
        const v1 = new Vector3d(this.y - this.z, this.z - this.x, this.x - this.y);
        const v2 = new Vector3d(this.y + this.z, -this.z - this.x, -this.x + this.y);
        const l1 = v1.squareLength;
        const l2 = v2.squareLength;
        return l1 > l2 ? v1.getScaled(1 / Math.sqrt(l1)) : v2.getScaled(1 / Math.sqrt(l2));
    }

    getNormalized(): Vector3d {
        let l = this.squareLength;
        if (l > 0) {
            l = 1 / Math.sqrt(l);
            return new Vector3d(this.x * l, this.y * l, this.z * l);
        } else
            return this.clone();
    }

    getNormalizedCrossProduct(v: ReadonlyVector3d): Vector3d {
        const x = this.y * v.z - this.z * v.y;
        const y = this.z * v.x - this.x * v.z;
        const z = this.x * v.y - this.y * v.x;
        let l = x * x + y * y + z * z;
        if (l > 0) {
            l = 1 / Math.sqrt(l);
            return new Vector3d(x * l, y * l, z * l);
        } else {
            return new Vector3d(x, y, z);
        }
    }

    getProjected(v: ReadonlyVector3d): Vector3d {
        const dot = this.getDotProduct(v);
        return v.getScaled(dot / v.squareLength);
    }

    getRotated(axis: ReadonlyVector3d): Vector3d {
        let angle = axis.length;
        if (angle > 0) {
            const normAxis = axis.getScaled(1 / angle);
            const ax2 = normAxis.getCrossProduct(this);
            const ax1 = ax2.getCrossProduct(normAxis);
            const ret = normAxis.getScaled(normAxis.getDotProduct(this));
            ret.add(ax1.getScaled(Math.cos(angle)));
            ret.add(ax2.getScaled(Math.sin(angle)));
            return ret;
        } else
            return this.clone();
    }

    getScaled(f: number): Vector3d {
        return new Vector3d(this.x * f, this.y * f, this.z * f);
    }

    getSum(v: ReadonlyVector3d): Vector3d {
        return new Vector3d(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    getSumScaled(v: ReadonlyVector3d, f: number): Vector3d {
        return new Vector3d(this.x + v.x * f, this.y + v.y * f, this.z + v.z * f);
    }

    getXY(): Vector2d {
        return new Vector2d(this.x, this.y);
    }

    getXZ(): Vector2d {
        return new Vector2d(this.x, this.z);
    }

    getYZ(): Vector2d {
        return new Vector2d(this.y, this.z);
    }

    normalize(): number {
        let l = this.squareLength;
        if (l > 0 && l !== 1) {
            l = Math.sqrt(l);
            const f = 1 / l;
            this.x *= f;
            this.y *= f;
            this.z *= f;
            return l;
        } else
            return 0;
    }

    project(v: ReadonlyVector3d) {
        const dot = this.getDotProduct(v) / v.squareLength;
        this.set(v.x * dot, v.y * dot, v.z * dot);
    }

    rotate(axis: ReadonlyVector3d) {
        let angle = axis.length;
        if (angle > 0) {
            const normAxis = axis.getScaled(1 / angle);
            const ax2 = normAxis.getCrossProduct(this);
            const ax1 = ax2.getCrossProduct(normAxis);
            const newV = normAxis.getScaled(normAxis.getDotProduct(this));
            newV.addScaled(ax1, Math.cos(angle));
            newV.addScaled(ax2, Math.sin(angle));
            this.setVector(newV);
        }
    }

    scale(f: number) {
        this.x *= f;
        this.y *= f;
        this.z *= f;
    }

    set(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    setScaled(v: ReadonlyVector3d, f: number) {
        this.set(v.x * f, v.y * f, v.z * f);
    }

    setVector(other: ReadonlyVector3d) {
        this.x = other.x;
        this.y = other.y;
        this.z = other.z;
    }

    subtract(v: ReadonlyVector3d) {
        if (!v.isZero) {
            this.x -= v.x;
            this.y -= v.y;
            this.z -= v.z;
        }
    }

    toString(): string { return `Vector3d(${this.x}, ${this.y}, ${this.z})` }

    withLength(len: number): Vector3d {
        let l = this.squareLength;
        if (l > 0) {
            l = len / Math.sqrt(l);
            return new Vector3d(this.x * l, this.y * l, this.z * l);
        } else
            return this.clone();
    }
}