export interface ReadonlyPoint2d {
    readonly x: number;
    readonly y: number;
}

export class Point2d implements ReadonlyPoint2d {

    constructor(public x: number, public y: number) { }
}