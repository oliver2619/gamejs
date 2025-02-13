export interface ReadonlyColor {
    readonly r: number;
    readonly g: number;
    readonly b: number;
    readonly a: number;

    clone(): Color;
}

export class Color implements ReadonlyColor {

    constructor(public r: number, public g: number, public b: number, public a: number = 1) { }

    clone(): Color {
        return new Color(this.r, this.g, this.b, this.a);
    }

    set(r: number, g: number, b: number): void;
    set(r: number, g: number, b: number, a: number): void;
    set(c: ReadonlyColor): void;
    set(...args: any[]) {
        if (typeof args[0] === 'number') {
            this.r = args[0];
            this.g = args[1];
            this.b = args[2];
            this.a = args[3] ?? 1;
        } else {
            this.r = args[0].r;
            this.g = args[0].g;
            this.b = args[0].b;
            this.a = args[0].a;
        }
    }
}