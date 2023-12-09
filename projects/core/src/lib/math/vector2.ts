import { EventObservable } from "../event/event-observable";

export abstract class ReadonlyVector2 {
    abstract readonly x: number;
    abstract readonly y: number;
    abstract readonly length: number;

    get isZero(): boolean {
        return this._x === 0 && this._y === 0;
    }

    get squareLength(): number {
        return this._x * this._x + this._y * this._y;
    }

    get normal(): Vector2 {
        return new Vector2(this._y, -this._x).getNormalized();
    }

    constructor(protected _x: number, protected _y: number) { }

    clone(): Vector2 {
        return new Vector2(this._x, this._y);
    }

    equals(v: ReadonlyVector2): boolean {
        return this._x === v.x && this._y === v.y;
    }

    getCrossProductWithScalar(z: number): Vector2 {
        return new Vector2(this._y * z, -this._x * z);
    }

    getCrossProductWithVector(v: ReadonlyVector2): number {
        return this._x * v._y - this._y * v._x;
    }

    getDifference(v: ReadonlyVector2): Vector2 {
        return new Vector2(this._x - v.x, this._y - v.y);
    }

    getDirectionFrom(v: ReadonlyVector2): Vector2 {
        const x = this._x - v.x;
        const y = this._y - v.y;
        let l = x * x + y * y;
        if (l > 0) {
            l = 1 / Math.sqrt(l);
            return new Vector2(x * l, y * l);
        } else {
            return new Vector2(x, y);
        }
    }

    getDistance(v: ReadonlyVector2): number {
        const dx = this._x - v.x;
        const dy = this._y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    getDotProduct(v: ReadonlyVector2): number {
        return this._x * v.x + this._y * v.y;
    }

    getInterpolated(v: ReadonlyVector2, f: number): Vector2 {
        const g = 1 - f;
        return new Vector2(this._x * g + v.x * f, this._y * g + v.y * f);
    }

    getNormalized(): Vector2 {
        let l = this.squareLength;
        if (l > 0) {
            l = 1 / Math.sqrt(l);
            return new Vector2(this._x * l, this._y * l);
        } else
            return this.clone();
    }

    getNormalizedCrossProduct(z: number): Vector2 {
        const x = this._y * z;
        const y = -this._x * z;
        let l = x * x + y * y;
        if (l > 0) {
            l = 1 / Math.sqrt(l);
            return new Vector2(x * l, y * l);
        } else {
            return new Vector2(x, y);
        }
    }

    getProjected(v: ReadonlyVector2): Vector2 {
        const dot = this.getDotProduct(v);
        return v.getScaled(dot / v.squareLength);
    }

    getRotated(angle: number): Vector2 {
        if (angle !== 0) {
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);
            const nx = this._x * cos - this._y * sin;
            const ny = this._x * sin + this._y * cos;
            return new Vector2(nx, ny);
        } else
            return this.clone();
    }

    getScaled(f: number): Vector2 {
        return new Vector2(this._x * f, this._y * f);
    }

    getSum(v: ReadonlyVector2): Vector2 {
        return new Vector2(this._x + v.x, this._y + v.y);
    }

    getSumScaled(v: ReadonlyVector2, f: number): Vector2 {
        return new Vector2(this._x + v.x * f, this._y + v.y * f);
    }

    getWithLength(len: number): Vector2 {
        let l = this.squareLength;
        if (l > 0) {
            l = len / Math.sqrt(l);
            return new Vector2(this._x * l, this._y * l);
        } else
            return this.clone();
    }

    toString(): string { return `Vector2(${this._x}, ${this._y})` }
}

export class Vector2 extends ReadonlyVector2 {

    readonly onModify = new EventObservable<ReadonlyVector2>();

    get length(): number {
        return Math.sqrt(this.squareLength);
    }

    set length(l: number) {
        let ls = this.squareLength;
        if (ls > 0) {
            const f = l / Math.sqrt(ls);
            this._x *= f;
            this._y *= f;
            this.onModify.produce(this);
        }
    }

    get x(): number {
        return this._x;
    }

    set x(x: number) {
        if (this._x !== x) {
            this._x = x;
            this.onModify.produce(this);
        }
    }

    get y(): number {
        return this._y;
    }

    set y(y: number) {
        if (this._y !== y) {
            this._y = y;
            this.onModify.produce(this);
        }
    }

    constructor(x: number, y: number) {
        super(x, y);
    }

    static Zero(): Vector2 {
        return new Vector2(0, 0);
    }

    add(v: ReadonlyVector2): Vector2 {
        if (!v.isZero) {
            this._x += v.x;
            this._y += v.y;
            this.onModify.produce(this);
        }
        return this;
    }

    addScaled(v: ReadonlyVector2, f: number): Vector2 {
        if (!v.isZero && f !== 0) {
            this._x += v.x * f;
            this._y += v.y * f;
            this.onModify.produce(this);
        }
        return this;
    }

    normalize(): number {
        let l = this.squareLength;
        if (l > 0 && l !== 1) {
            l = Math.sqrt(l);
            const f = 1 / l;
            this._x *= f;
            this._y *= f;
            this.onModify.produce(this);
            return l;
        } else
            return 0;
    }

    project(v: ReadonlyVector2): Vector2 {
        const dot = this.getDotProduct(v) / v.squareLength;
        return this.set(v.x * dot, v.y * dot);
    }

    rotate(angle: number): Vector2 {
        if (angle !== 0) {
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);
            const nx = this.x * cos - this.y * sin;
            const ny = this.x * sin + this.y * cos;
            this.set(nx, ny);
        }
        return this;
    }

    scale(f: number): Vector2 {
        if (f !== 1) {
            this._x *= f;
            this._y *= f;
            this.onModify.produce(this);
        }
        return this;
    }

    set(x: number, y: number): Vector2 {
        if (x !== this._x || y !== this._y) {
            this._x = x;
            this._y = y;
            this.onModify.produce(this);
        }
        return this;
    }

    setScaled(v: ReadonlyVector2, f: number): Vector2 {
        return this.set(v.x * f, v.y * f);
    }

    setVector(v: ReadonlyVector2): Vector2 {
        return this.set(v.x, v.y);
    }
}