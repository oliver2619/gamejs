import { ReadonlyVector2d, Vector2d } from "./vector-2d";

export interface ReadonlyRectangle {
    readonly size: ReadonlyVector2d;
    readonly width: number;
    readonly height: number;
    readonly x1: number;
    readonly y1: number;
    readonly x2: number;
    readonly y2: number;
    readonly isEmpty: boolean;

    clone(): Rectangle;

    equals(other: ReadonlyRectangle): boolean;

    getIntersected(other: ReadonlyRectangle): Rectangle;
}

export class Rectangle implements ReadonlyRectangle {

    readonly size: Vector2d;

    get height(): number {
        return this.size.y;
    }

    set height(h: number) {
        this.size.y = h;
    }

    get width(): number {
        return this.size.x;
    }

    set width(w: number) {
        this.size.x = w;
    }

    get x2(): number {
        return this.x1 + this.size.x;
    }

    set x2(x: number) {
        this.size.x = x - this.x1;
    }

    get y2(): number {
        return this.y1 + this.size.y;
    }

    set y2(y: number) {
        this.size.y = y - this.y1;
    }

    get isEmpty(): boolean {
        return this.size.x <= 0 || this.size.y <= 0;
    }

    constructor(public x1: number, public y1: number, width: number, height: number) {
        this.size = new Vector2d(width, height);
    }

    clone(): Rectangle {
        return new Rectangle(this.x1, this.y1, this.width, this.height);
    }

    equals(other: ReadonlyRectangle): boolean {
        return this.x1 === other.x1 && this.y1 === other.y1 && this.size.equals(other.size);
    }

    getIntersected(other: ReadonlyRectangle): Rectangle {
        const x1 = Math.max(this.x1, other.x1);
        const y1 = Math.max(this.y1, other.y1);
        const x2 = Math.min(this.x2, other.x2);
        const y2 = Math.min(this.y2, other.y2);
        return new Rectangle(x1, y1, x2 - x1, y2 - y1);
    }

    intersect(other: ReadonlyRectangle) {
        const x1 = Math.max(this.x1, other.x1);
        const y1 = Math.max(this.y1, other.y1);
        const x2 = Math.min(this.x2, other.x2);
        const y2 = Math.min(this.y2, other.y2);
        this.x1 = x1;
        this.y1 = y1;
        this.width = x2 - x1;
        this.height = y2 - y1;
    }

    set(x1: number, y1: number, width: number, height: number) {
        this.x1 = x1;
        this.y1 = y1;
        this.width = width;
        this.height = height;
    }

    setRectangle(other: ReadonlyRectangle) {
        this.x1 = other.x1;
        this.y1 = other.y1;
        this.size.setVector(other.size);
    }
}