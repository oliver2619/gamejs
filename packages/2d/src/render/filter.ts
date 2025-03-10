import { Color, ReadonlyColor } from "@pluto/core";
import { RenderingContext2d } from "../component/rendering-context-2d";

export interface Filter {
    brightness: number;
    contrast: number;
    saturate: number;
    grayscale: number;
    sepia: number;
    hueRotate: number;
    invert: number;
    opacity: number;
    blur: number;
    dropShadow: number;
}

interface FilterElement {

    buildCssValue(cssValue: string, data: Readonly<Filter>, shadowColor: string): string;

    // returns true if target is modified
    combine(target: Filter, withOther: Readonly<Filter>): boolean;
}

class NumberFilterElement implements FilterElement {

    constructor(
        private readonly key: keyof Filter,
        private readonly cssName: string,
        private readonly neutralValue: number,
        private readonly scale: number,
        private readonly unit: string,
        private readonly combineFn: (v1: number, v2: number) => number
    ) { }

    buildCssValue(cssValue: string, data: Readonly<Filter>, _: string): string {
        const value = Math.max(0, data[this.key]);
        if (value === this.neutralValue) {
            return cssValue;
        } else {
            return `${cssValue}${this.cssName}(${value * this.scale}${this.unit})`;
        }
    }

    combine(target: Filter, withOther: Readonly<Filter>): boolean {
        const oldValue = target[this.key];
        const newValue = this.combineFn(oldValue, withOther[this.key]);
        if (newValue !== oldValue) {
            target[this.key] = newValue;
            return true;
        } else {
            return false;
        }
    }
}

class ShadowFilterElement implements FilterElement {

    buildCssValue(cssValue: string, data: Readonly<Filter>, shadowColor: string): string {
        const value = Math.max(0, data.dropShadow);
        if (value === 0) {
            return cssValue;
        } else {
            return `${cssValue}drop-shadow(0 0 ${value}px ${shadowColor})`;
        }
    }

    combine(target: Filter, withOther: Readonly<Filter>): boolean {
        const otherValue = withOther.dropShadow;
        if (otherValue !== 0) {
            target.dropShadow = otherValue;
            return true;
        } else {
            return false;
        }
    }
}

const combineAdd = (v1: number, v2: number) => v1 + v2;
const combineMultiply = (v1: number, v2: number) => v1 * v2;
const combineMultiplyInverse = (v1: number, v2: number) => v1 + v2 - v1 * v2;

const allFilterElements: FilterElement[] = [
    new NumberFilterElement('blur', 'blur', 0, 1, 'px', combineAdd),
    new NumberFilterElement('brightness', 'brightness', 1, 100, '%', combineMultiply),
    new NumberFilterElement('contrast', 'contrast', 1, 100, '%', combineMultiply),
    new NumberFilterElement('grayscale', 'grayscale', 0, 100, '%', combineMultiplyInverse),
    new NumberFilterElement('hueRotate', 'hue-rotate', 0, 360, 'deg', combineAdd),
    new NumberFilterElement('invert', 'invert', 0, 100, '%', combineMultiplyInverse),
    new NumberFilterElement('opacity', 'opacity', 1, 100, '%', combineMultiply),
    new NumberFilterElement('saturate', 'saturate', 1, 100, '%', combineMultiply),
    new NumberFilterElement('sepia', 'sepia', 0, 100, '%', combineMultiplyInverse),
    new ShadowFilterElement(),
];

export interface FilterStackData {
    filter?: Partial<Filter> | undefined,
    shadowColor?: ReadonlyColor | undefined,
}

export class FilterStack {

    private data: Filter;
    private filter = '';
    private modified = false;
    private _shadowColor;

    get blur(): number {
        return this.data.blur;
    }

    set blur(b: number) {
        if (b !== this.data.blur) {
            this.data.blur = b;
            this.modified = true;
        }
    }

    get brightness(): number {
        return this.data.brightness;
    }

    set brightness(b: number) {
        if (b !== this.data.brightness) {
            this.data.brightness = b;
            this.modified = true;
        }
    }

    get contrast(): number {
        return this.data.contrast;
    }

    set contrast(c: number) {
        if (c !== this.data.contrast) {
            this.data.contrast = c;
            this.modified = true;
        }
    }

    get grayscale(): number {
        return this.data.grayscale;
    }

    set grayscale(g: number) {
        if (g !== this.data.grayscale) {
            this.data.grayscale = g;
            this.modified = true;
        }
    }

    get hueRotate(): number {
        return this.data.hueRotate;
    }

    set hueRotate(h: number) {
        if (h !== this.data.hueRotate) {
            this.data.hueRotate = h;
            this.modified = true;
        }
    }

    get invert(): number {
        return this.data.invert;
    }

    set invert(i: number) {
        if (i !== this.data.invert) {
            this.data.invert = i;
            this.modified = true;
        }
    }

    get opacity(): number {
        return this.data.opacity;
    }

    set opacity(i: number) {
        if (i !== this.data.opacity) {
            this.data.opacity = i;
            this.modified = true;
        }
    }

    get saturate(): number {
        return this.data.saturate;
    }

    set saturate(i: number) {
        if (i !== this.data.saturate) {
            this.data.saturate = i;
            this.modified = true;
        }
    }

    get sepia(): number {
        return this.data.sepia;
    }

    set sepia(i: number) {
        if (i !== this.data.sepia) {
            this.data.sepia = i;
            this.modified = true;
        }
    }

    get shadowColor(): ReadonlyColor {
        return this._shadowColor;
    }

    set shadowColor(c: ReadonlyColor) {
        if (!this._shadowColor.equals(c)) {
            this._shadowColor.setColor(c);
            this.modified = true;
        }
    }

    constructor(data?: FilterStackData) {
        this.data = data?.filter == undefined ? FilterStack.createDefaultFilter() : FilterStack.createPartialFilter(data.filter);
        this._shadowColor = data?.shadowColor?.clone() ?? new Color(0, 0, 0, 1);
        this.modified = true;
    }

    static createDefaultFilter(): Filter {
        return {
            blur: 0,
            brightness: 1,
            contrast: 1,
            grayscale: 0,
            hueRotate: 0,
            invert: 0,
            opacity: 1,
            saturate: 1,
            sepia: 0,
            dropShadow: 0,
        };
    }

    static createPartialFilter(filter: Partial<Filter>): Filter {
        return { ...this.createDefaultFilter(), ...filter };
    }

    use() {
        if (this.modified) {
            this.filter = '';
            const shadowColor = this._shadowColor.toHtmlRgba();
            allFilterElements.forEach(it => this.filter = it.buildCssValue(this.filter, this.data, shadowColor));
            this.modified = false;
        }
        RenderingContext2d.currentCanvasRenderingContext2d.filter = this.filter;
    }

    withFilter(other: Filter, callback: () => void) {
        const prevData: Filter = { ...this.data };
        const prevModified = this.modified;
        const prevFilter = this.filter;
        try {
            allFilterElements.forEach(it => this.modified = it.combine(this.data, other) || this.modified);
            callback();
        } finally {
            this.data = prevData;
            this.modified = prevModified;
            this.filter = prevFilter;
        }
    }
}