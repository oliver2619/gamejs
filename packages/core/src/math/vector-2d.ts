export interface ReadonlyVector2d {
    readonly x: number;
    readonly y: number;

    clone(): Vector2d;
}

export class Vector2d implements ReadonlyVector2d {

    constructor(public x: number, public y: number) { }

    clone() {
        return new Vector2d(this.x, this.y);
    }
}