import { Point2d, ReadonlyPoint2d } from "./point-2d";

export interface ReadonlyRect2d {
    readonly size: ReadonlyPoint2d;
    readonly width: number;
    readonly height: number;
    readonly x1: number;
    readonly y1: number;
    readonly x2: number;
    readonly y2: number;

    intersected(other: ReadonlyRect2d): Rect2d;
}

export class Rect2d implements ReadonlyRect2d {

    readonly size: Point2d;

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
        this.size = new Point2d(width, height);
    }

    intersect(other: ReadonlyRect2d) {
        const x1 = Math.max(this.x1, other.x1);
        const y1 = Math.max(this.y1, other.y1);
        const x2 = Math.min(this.x2, other.x2);
        const y2 = Math.min(this.y2, other.y2);
        this.x1 = x1;
        this.y1 = y1;
        this.width = x2 - x1;
        this.height = y2 - y1;
    }

    intersected(other: ReadonlyRect2d): Rect2d {
        const x1 = Math.max(this.x1, other.x1);
        const y1 = Math.max(this.y1, other.y1);
        const x2 = Math.min(this.x2, other.x2);
        const y2 = Math.min(this.y2, other.y2);
        return new Rect2d(x1, y1, x2 - x1, y2 - y1);
    }

    set(x1: number, y1: number, width: number, height: number) {
        this.x1 = x1;
        this.y1 = y1;
        this.width = width;
        this.height = height;
    }
}