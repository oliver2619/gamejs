export interface ReadonlyVector2d {
    readonly x: number;
    readonly y: number;
    readonly length: number;
    readonly isZero: boolean;
    readonly squareLength: number;
    clone(): Vector2d;
    equals(other: ReadonlyVector2d): boolean;
    getCrossProductWithScalar(z: number): Vector2d;
    getCrossProductWithVector(v: ReadonlyVector2d): number;
    getDifference(v: ReadonlyVector2d): Vector2d;
    getDirectionFrom(v: ReadonlyVector2d): Vector2d;
    getDistance(v: ReadonlyVector2d): number;
    getDotProduct(v: ReadonlyVector2d): number;
    getInterpolated(v: ReadonlyVector2d, f: number): Vector2d;
    getNormal(): Vector2d;
    getNormalized(): Vector2d;
    getNormalizedCrossProduct(z: number): Vector2d;
    getProjected(v: ReadonlyVector2d): Vector2d;
    getRotated(angle: number): Vector2d;
    getScaled(f: number): Vector2d;
    getSum(v: ReadonlyVector2d): Vector2d;
    getSumScaled(v: ReadonlyVector2d, f: number): Vector2d;
    toString(): string;
    withLength(len: number): Vector2d;
}

export class Vector2d implements ReadonlyVector2d {

    get isZero(): boolean {
        return this.x === 0 && this.y === 0;
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
        }
    }

    get squareLength(): number {
        return this.x * this.x + this.y * this.y;
    }

    constructor(public x: number, public y: number) { }

    static Zero(): Vector2d {
        return new Vector2d(0, 0);
    }

    add(v: ReadonlyVector2d) {
        if (!v.isZero) {
            this.x += v.x;
            this.y += v.y;
        }
    }

    addScaled(v: ReadonlyVector2d, f: number) {
        if (!v.isZero && f !== 0) {
            this.x += v.x * f;
            this.y += v.y * f;
        }
    }

    clone() {
        return new Vector2d(this.x, this.y);
    }

    equals(v: ReadonlyVector2d): boolean {
        return this.x === v.x && this.y === v.y;
    }

    getNormal(): Vector2d {
        return new Vector2d(this.y, -this.x).getNormalized();
    }

    getCrossProductWithScalar(z: number): Vector2d {
        return new Vector2d(this.y * z, -this.x * z);
    }

    getCrossProductWithVector(v: ReadonlyVector2d): number {
        return this.x * v.y - this.y * v.x;
    }

    getDifference(v: ReadonlyVector2d): Vector2d {
        return new Vector2d(this.x - v.x, this.y - v.y);
    }

    getDirectionFrom(v: ReadonlyVector2d): Vector2d {
        const x = this.x - v.x;
        const y = this.y - v.y;
        let l = x * x + y * y;
        if (l > 0) {
            l = 1 / Math.sqrt(l);
            return new Vector2d(x * l, y * l);
        } else {
            return new Vector2d(x, y);
        }
    }

    getDistance(v: ReadonlyVector2d): number {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    getDotProduct(v: ReadonlyVector2d): number {
        return this.x * v.x + this.y * v.y;
    }

    getInterpolated(v: ReadonlyVector2d, f: number): Vector2d {
        const g = 1 - f;
        return new Vector2d(this.x * g + v.x * f, this.y * g + v.y * f);
    }

    getNormalized(): Vector2d {
        let l = this.squareLength;
        if (l > 0) {
            l = 1 / Math.sqrt(l);
            return new Vector2d(this.x * l, this.y * l);
        } else
            return this.clone();
    }

    getNormalizedCrossProduct(z: number): Vector2d {
        const x = this.y * z;
        const y = -this.x * z;
        let l = x * x + y * y;
        if (l > 0) {
            l = 1 / Math.sqrt(l);
            return new Vector2d(x * l, y * l);
        } else {
            return new Vector2d(x, y);
        }
    }

    getProjected(v: ReadonlyVector2d): Vector2d {
        const dot = this.getDotProduct(v);
        return v.getScaled(dot / v.squareLength);
    }

    getRotated(angle: number): Vector2d {
        if (angle !== 0) {
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);
            const nx = this.x * cos - this.y * sin;
            const ny = this.x * sin + this.y * cos;
            return new Vector2d(nx, ny);
        } else
            return this.clone();
    }

    getScaled(f: number): Vector2d {
        return new Vector2d(this.x * f, this.y * f);
    }

    getSum(v: ReadonlyVector2d): Vector2d {
        return new Vector2d(this.x + v.x, this.y + v.y);
    }

    getSumScaled(v: ReadonlyVector2d, f: number): Vector2d {
        return new Vector2d(this.x + v.x * f, this.y + v.y * f);
    }

    isParallel(v: ReadonlyVector2d): boolean {
        return this.x * v.y - this.y * v.x === 0;
    }

    normalize(): number {
        let l = this.squareLength;
        if (l > 0 && l !== 1) {
            l = Math.sqrt(l);
            const f = 1 / l;
            this.x *= f;
            this.y *= f;
            return l;
        } else
            return 0;
    }

    project(v: ReadonlyVector2d) {
        const dot = this.getDotProduct(v) / v.squareLength;
        this.set(v.x * dot, v.y * dot);
    }

    rotate(angle: number) {
        if (angle !== 0) {
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);
            const nx = this.x * cos - this.y * sin;
            const ny = this.x * sin + this.y * cos;
            this.set(nx, ny);
        }
    }

    scale(f: number) {
        if (f !== 1) {
            this.x *= f;
            this.y *= f;
        }
    }

    set(x: number, y: number) {
        if (x !== this.x || y !== this.y) {
            this.x = x;
            this.y = y;
        }
    }

    setScaled(v: ReadonlyVector2d, f: number) {
        this.set(v.x * f, v.y * f);
    }

    setVector(v: ReadonlyVector2d) {
        this.set(v.x, v.y);
    }

    subtract(v: ReadonlyVector2d) {
        if (!v.isZero) {
            this.x -= v.x;
            this.y -= v.y;
        }
    }

    toString(): string { return `Vector2d(${this.x}, ${this.y})` }

    withLength(len: number): Vector2d {
        let l = this.squareLength;
        if (l > 0) {
            l = len / Math.sqrt(l);
            return new Vector2d(this.x * l, this.y * l);
        } else
            return this.clone();
    }
}