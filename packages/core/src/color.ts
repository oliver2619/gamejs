import { EventObservable } from "./event/event-observable";

export abstract class ReadonlyColor {

    static readonly RED_LAMBDA = 440;
    static readonly GREEN_LAMBDA = 550;
    static readonly BLUE_LAMBDA = 680;

    abstract readonly a: number;
    abstract readonly b: number;
    abstract readonly g: number;
    abstract readonly r: number;
    abstract readonly luminance: number;
    abstract readonly minComponent: number;
    abstract readonly maxComponent: number;
    abstract readonly saturation: number;

    protected _a: number;

    get inverse(): Color {
        return new Color(1. - this._r, 1. - this._g, 1. - this._b, 1. - this._a);
    }

    get isBlack(): boolean {
        return this._r === 0 && this._g === 0 && this._b === 0;
    }

    constructor(protected _r: number, protected _g: number, protected _b: number, a?: number) {
        this._a = a !== undefined ? a : 1;
    }

    clone(): Color {
        return new Color(this._r, this._g, this._b, this._a);
    }

    equals(c: ReadonlyColor): boolean {
        return this._r === c.r && this._g === c.g && this._b === c.b && this._a === c.a;
    }

    equalsRGB(c: ReadonlyColor): boolean {
        return this._r === c.r && this._g === c.g && this._b === c.b;
    }

    getClamped(): Color {
        return new Color(
            this._r > 0 ? Math.min(1, this._r) : 0,
            this._g > 0 ? Math.min(1, this._g) : 0,
            this._b > 0 ? Math.min(1, this._b) : 0,
            this._a > 0 ? Math.min(1, this._a) : 0);
    }

    getMultiplied(c: ReadonlyColor): Color {
        return new Color(this._r * c.r, this._g * c.g, this._b * c.b, this._a * c.a);
    }

    getScaled(f: number): Color {
        return new Color(this._r * f, this._g * f, this._b * f, this._a * f);
    }

    getSum(c: ReadonlyColor): Color {
        return new Color(this._r + c.r, this._g + c.g, this._b + c.b, this._a + c.a);
    }

    getSumMultiplied(c: ReadonlyColor, c2: ReadonlyColor): Color {
        return new Color(this._r + c.r * c2.r, this._g + c.g * c2.g, this._b + c.b * c2.b, this._a + c.a * c2.a);
    }

    getSumScaled(c: ReadonlyColor, f: number): Color {
        return new Color(this._r + c.r * f, this._g + c.g * f, this._b + c.b * f, this._a + c.a * f);
    }

    toHtmlRgb(): string {
        return `rgb(${Math.round(this._r * 255)}, ${Math.round(this._g * 255)}, ${Math.round(this._b * 255)})`;
    }

    toHtmlRgba(): string {
        return `rgba(${Math.round(this._r * 255)}, ${Math.round(this._g * 255)}, ${Math.round(this._b * 255)}, ${this._a})`;
    }

    toString(): string {
        return `Color(${this._r}, ${this._g}, ${this._b}, ${this._a})`;
    }

    withAlpha(alpha: number): Color {
        return new Color(this._r, this._g, this._b, alpha);
    }

    withHue(h: number): Color {
        return Color.hsv(h, this.saturation, this.maxComponent, this._a);
    }

    withMaxComponent(max: number): Color {
        const ret = this.clone();
        ret.maxComponent = max;
        return ret;
    }

    withMinComponent(min: number): Color {
        const ret = this.clone();
        ret.minComponent = min;
        return ret;
    }

    withLuminance(luminance: number): Color {
        const ret = this.clone();
        ret.luminance = luminance;
        return ret;
    }

    withSaturation(saturation: number): Color {
        const ret = this.clone();
        ret.saturation = saturation;
        return ret;
    }
}

export class Color extends ReadonlyColor {

    readonly onChange = new EventObservable<Color>();

    get a(): number {
        return this._a;
    }

    set a(a: number) {
        this._a = a;
        this.onChange.produce(this);
    }

    get b(): number {
        return this._b;
    }

    set b(b: number) {
        this._b = b;
        this.onChange.produce(this);
    }

    get g(): number {
        return this._g;
    }

    set g(g: number) {
        this._g = g;
        this.onChange.produce(this);
    }

    get r(): number {
        return this._r;
    }

    set r(r: number) {
        this._r = r;
        this.onChange.produce(this);
    }

    get luminance(): number {
        return this._r * .3 + this._g * .59 + this._b * .11;
    }

    set luminance(v: number) {
        let f = this.luminance;
        if (f !== 0) {
            f = v / f;
            this._r *= f;
            this._g *= f;
            this._b *= f;
        } else {
            this._r = v;
            this._g = v;
            this._b = v;
        }
        this.onChange.produce(this);
    }

    get maxComponent(): number {
        return Math.max(this._r, this._g, this._b);
    }

    set maxComponent(v: number) {
        let f = this.maxComponent;
        if (f !== 0) {
            f = v / f;
            this._r *= f;
            this._g *= f;
            this._b *= f;
        } else {
            this._r = v;
            this._g = v;
            this._b = v;
        }
        this.onChange.produce(this);
    }

    get minComponent(): number {
        return Math.min(this._r, this._g, this._b);
    }

    set minComponent(v: number) {
        let max = this.maxComponent;
        let f = this.minComponent;
        if (f !== max) {
            f = (max - v) / (max - f);
            this._r = max - (max - this._r) * f;
            this._g = max - (max - this._g) * f;
            this._b = max - (max - this._b) * f;
        } else {
            this._r = v;
            this._g = v;
            this._b = v;
        }
        this.onChange.produce(this);
    }

    get saturation(): number {
        const max = this.maxComponent;
        return max > 0 ? (max - this.minComponent) / max : 1;
    }

    set saturation(v: number) {
        const max = this.maxComponent;
        this.minComponent = max - v * max;
    }

    constructor(r: number, g: number, b: number, a?: number) {
        super(r, g, b, a);
    }

    static black(a?: number): Color {
        return new Color(0, 0, 0, a !== undefined ? a : 0);
    }

    static white(a?: number): Color {
        return new Color(1, 1, 1, a !== undefined ? a : 1);
    }

    static rgba(r: number, g: number, b: number, a?: number): Color {
        return new Color(r, g, b, a);
    }

    static hsv(h: number, s: number, v: number, a?: number): Color {
        const min = v * (1 - s);
        const max = 6 * (v - min);
        if (h < 1 / 3) {
            if (h < 1 / 6) {
                return new Color(v, max * h + min, min, a);
            } else {
                return new Color(max * (2 / 6 - h) + min, v, min, a);
            }
        } else if (h < 2 / 3) {
            if (h < 3 / 6) {
                return new Color(min, v, max * (h - 2 / 6) + min, a);
            } else {
                return new Color(min, max * (4 / 6 - h) + min, v, a);
            }
        } else {
            if (h < 5 / 6) {
                return new Color(max * (h - 4 / 6) + min, min, v, a);
            } else {
                return new Color(v, min, max * (1 - h) + min, a);
            }
        }
    }

    add(c: ReadonlyColor): Color {
        this._r += c.r;
        this._g += c.g;
        this._b += c.b;
        this._a += c.a;
        this.onChange.produce(this);
        return this;
    }

    addMultiplied(c: ReadonlyColor, c2: ReadonlyColor): Color {
        this._r += c.r * c2.r;
        this._g += c.g * c2.g;
        this._b += c.b * c2.b;
        this._a += c.a * c2.a;
        this.onChange.produce(this);
        return this;
    }

    addScaled(c: ReadonlyColor, f: number): Color {
        this._r += c.r * f;
        this._g += c.g * f;
        this._b += c.b * f;
        this._a += c.a * f;
        this.onChange.produce(this);
        return this;
    }

    clamp(): Color {
        this._r = this._r > 0 ? Math.min(1, this._r) : 0;
        this._g = this._g > 0 ? Math.min(1, this._g) : 0;
        this._b = this._b > 0 ? Math.min(1, this._b) : 0;
        this._a = this._a > 0 ? Math.min(1, this._a) : 0;
        this.onChange.produce(this);
        return this;
    }

    multiply(c: ReadonlyColor): Color {
        this._r *= c.r;
        this._g *= c.g;
        this._b *= c.b;
        this._a *= c.a;
        this.onChange.produce(this);
        return this;
    }

    scale(f: number): Color {
        this._r *= f;
        this._g *= f;
        this._b *= f;
        this._a *= f;
        this.onChange.produce(this);
        return this;
    }

    set(r: number, g: number, b: number, a?: number): Color {
        this._r = r;
        this._g = g;
        this._b = b;
        this._a = a !== undefined ? a : 1;
        this.onChange.produce(this);
        return this;
    }

    setColor(color: ReadonlyColor): Color {
        this._r = color.r;
        this._g = color.g;
        this._b = color.b;
        this._a = color.a;
        this.onChange.produce(this);
        return this;
    }
}