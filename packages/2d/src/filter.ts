import {Color, ReadonlyColor} from 'core/src/index';

class FilterElement {

    private _value: number;
    private _cssValue = '';

    get isNeutral(): boolean {
        return this._value === this.neutral;
    }

    get value(): number {
        return this._value;
    }

    set value(v: number) {
        const newVal = Math.max(0, v);
        if (this._value !== newVal) {
            this._value = newVal;
            if (this.isNeutral) {
                this._cssValue = '';
            } else {
                this._cssValue = `${this.name}(${this._value * this.scale}${this.unit})`;
            }
            this.onModify();
        }
    }

    get cssValue(): string {
        return this._cssValue;
    }

    constructor(private readonly name: string, private readonly neutral: number, private readonly scale: number, private readonly unit: string, private readonly onModify: () => void) {
        this._value = neutral;
    }
}

class ShadowFilterElement {

    readonly color: Color = new Color(0, 0, 0, 1);

    private _value: number = 0;
    private _cssValue = '';

    get isNeutral(): boolean {
        return this._value <= 0 || this.color.a <= 0;
    }

    get value(): number {
        return this._value;
    }

    set value(v: number) {
        if (this._value !== v) {
            this._value = v;
            this.updateCssValue();
        }
    }

    get cssValue(): string {
        return this._cssValue;
    }

    constructor(private readonly onModify: () => void) {
        this.color.onChange.subscribe(() => this.updateCssValue());
    }

    private updateCssValue() {
        if (this.isNeutral) {
            this._cssValue = '';
        } else {
            this._cssValue = `drop-shadow(0 0 ${this._value}px ${this.color.toHtmlRgba()})`;
        }
        this.onModify();
    }
}

export class Filter {

    private readonly modifyCallback = () => this.modified = true;

    private readonly _brightness = new FilterElement('brightness', 1, 100, '%', this.modifyCallback);
    private readonly _contrast = new FilterElement('contrast', 1, 100, '%', this.modifyCallback);
    private readonly _saturate = new FilterElement('saturate', 1, 100, '%', this.modifyCallback);
    private readonly _grayscale = new FilterElement('grayscale', 0, 100, '%', this.modifyCallback);
    private readonly _sepia = new FilterElement('sepia', 0, 100, '%', this.modifyCallback);
    private readonly _hueRotate = new FilterElement('hue-rotate', 0, 360, 'deg', this.modifyCallback);
    private readonly _invert = new FilterElement('invert', 0, 100, '%', this.modifyCallback);
    private readonly _opacity = new FilterElement('opacity', 0, 100, '%', this.modifyCallback);
    private readonly _blur = new FilterElement('blur', 0, 1, 'px', this.modifyCallback);
    private readonly _shadow = new ShadowFilterElement(this.modifyCallback);

    private modified = false;
    private _filter = '';

    get brightness(): number {
        return this._brightness.value;
    }

    set brightness(v: number) {
        this._brightness.value = v;
    }

    get contrast(): number {
        return this._contrast.value;
    }

    set contrast(v: number) {
        this._contrast.value = v;
    }

    get saturate(): number {
        return this._saturate.value;
    }

    set saturate(v: number) {
        this._saturate.value = v;
    }

    get grayscale(): number {
        return this._grayscale.value;
    }

    set grayscale(v: number) {
        this._grayscale.value = v;
    }

    get sepia(): number {
        return this._sepia.value;
    }

    set sepia(v: number) {
        this._sepia.value = v;
    }

    get hue(): number {
        return this._hueRotate.value;
    }

    set hue(v: number) {
        this._hueRotate.value = v;
    }

    get invert(): number {
        return this._invert.value;
    }

    set invert(v: number) {
        this._invert.value = v;
    }

    get opacity(): number {
        return this._opacity.value;
    }

    set opacity(v: number) {
        this._opacity.value = v;
    }

    get blur(): number {
        return this._blur.value;
    }

    set blur(v: number) {
        this._blur.value = v;
    }

    get shadow(): number {
        return this._shadow.value;
    }

    set shadow(v: number) {
        this._shadow.value = v;
    }

    get shadowColor(): ReadonlyColor {
        return this._shadow.color;
    }

    set shadowColor(v: ReadonlyColor) {
        this._shadow.color.setColor(v);
    }

    private get filter(): string {
        if (this.modified) {
            this.createFilter();
            this.modified = false;
        }
        return this._filter;
    }

    and(filter: Filter): Filter {
        if (this.isNeutral()) {
            return filter;
        }
        if (filter.isNeutral()) {
            return this;
        }
        const ret = new Filter();
        ret._brightness.value = this.brightness * filter.brightness;
        ret._contrast.value = this.contrast * filter.contrast;
        ret._saturate.value = this.saturate * filter.saturate;
        ret._grayscale.value = this.grayscale * filter.grayscale;
        ret._sepia.value = this.sepia * filter.sepia;
        ret._hueRotate.value = this.hue + filter.hue;
        ret._invert.value = this.invert * filter.invert;
        ret._opacity.value = this.opacity * filter.opacity;
        ret._blur.value = this.blur + filter.blur;
        ret._shadow.value = this.shadow + filter.shadow;
        ret._shadow.color.setColor(this.shadowColor.getMultiplied(filter.shadowColor));
        ret.createFilter();
        return ret;
    }

    use(context: CanvasRenderingContext2D) {
        context.filter = this.filter;
    }

    private isNeutral(): boolean {
        return this.filter === '';
    }

    private createFilter() {
        this._filter = '';
        this._filter += this._brightness.cssValue;
        this._filter += this._contrast.cssValue;
        this._filter += this._saturate.cssValue;
        this._filter += this._grayscale.cssValue;
        this._filter += this._sepia.cssValue;
        this._filter += this._hueRotate.cssValue;
        this._filter += this._invert.cssValue;
        this._filter += this._opacity.cssValue;
        this._filter += this._blur.cssValue;
        this._filter += this._shadow.cssValue;
    }
}