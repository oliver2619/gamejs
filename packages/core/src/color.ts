export interface ReadonlyColor {
    readonly r: number;
    readonly g: number;
    readonly b: number;
    readonly a: number;
    readonly luminance: number;
    readonly minComponent: number;
    readonly maxComponent: number;
    readonly saturation: number;
    readonly isBlack: boolean;
    clone(): Color;
    equals(other: ReadonlyColor): boolean;
    equalsRgb(other: ReadonlyColor): boolean;
    getClamped(): Color;
    getDifference(other: ReadonlyColor): Color;
    getInverted(): Color;
    getMultiplied(c: ReadonlyColor): Color;
    getScaled(f: number): Color;
    getSum(c: ReadonlyColor): Color;
    getSumMultiplied(c: ReadonlyColor, c2: ReadonlyColor): Color;
    getSumScaled(c: ReadonlyColor, f: number): Color;
    toHtmlRgb(): string;
    toHtmlRgba(): string;
    toString(): string;
    withAlpha(alpha: number): Color;
    withHue(h: number): Color;
    withMaxComponent(max: number): Color;
    withMinComponent(min: number): Color;
    withLuminance(luminance: number): Color;
    withSaturation(saturation: number): Color;
}

export class Color implements ReadonlyColor {

    static readonly RED_LAMBDA = 440;
    static readonly GREEN_LAMBDA = 550;
    static readonly BLUE_LAMBDA = 680;

    get isBlack(): boolean {
        return this.r === 0 && this.g === 0 && this.b === 0;
    }

    get luminance(): number {
        return this.r * .3 + this.g * .59 + this.b * .11;
    }

    set luminance(v: number) {
        let f = this.luminance;
        if (f !== 0) {
            f = v / f;
            this.r *= f;
            this.g *= f;
            this.b *= f;
        } else {
            this.r = v;
            this.g = v;
            this.b = v;
        }
    }

    get maxComponent(): number {
        return Math.max(this.r, this.g, this.b);
    }

    set maxComponent(v: number) {
        let f = this.maxComponent;
        if (f !== 0) {
            f = v / f;
            this.r *= f;
            this.g *= f;
            this.b *= f;
        } else {
            this.r = v;
            this.g = v;
            this.b = v;
        }
    }

    get minComponent(): number {
        return Math.min(this.r, this.g, this.b);
    }

    set minComponent(v: number) {
        let max = this.maxComponent;
        let f = this.minComponent;
        if (f !== max) {
            f = (max - v) / (max - f);
            this.r = max - (max - this.r) * f;
            this.g = max - (max - this.g) * f;
            this.b = max - (max - this.b) * f;
        } else {
            this.r = v;
            this.g = v;
            this.b = v;
        }
    }

    get saturation(): number {
        const max = this.maxComponent;
        return max > 0 ? (max - this.minComponent) / max : 1;
    }

    set saturation(v: number) {
        const max = this.maxComponent;
        this.minComponent = max - v * max;
    }

    constructor(public r: number, public g: number, public b: number, public a: number = 1) { }

    static black(a?: number): Color {
        return new Color(0, 0, 0, a ?? 1);
    }

    static white(a?: number): Color {
        return new Color(1, 1, 1, a ?? 1);
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

    static parseHex(c: string): Color {
        if (c.length === 3) {
            return new Color(Number.parseInt(c.substring(0, 1), 16) * 17 / 255, Number.parseInt(c.substring(1, 2), 16) * 17 / 255, Number.parseInt(c.substring(2, 3), 16) * 17 / 255);
        } else if (c.length === 6) {
            return new Color(Number.parseInt(c.substring(0, 2), 16) / 255, Number.parseInt(c.substring(2, 4), 16) / 255, Number.parseInt(c.substring(4, 6), 16) / 255);
        } else {
            throw new RangeError(`Unable to parse hex value ${c}.`);
        }
    }

    static parse(input: string): Color {
        const trimmed = input.trim();
        if (trimmed.startsWith('#')) {
            return Color.parseHex(trimmed.substring(1));
        }
        const res = /(?:^rgb\((?<rgb1>[^\)]+)\)$)|(?:^rgba\((?<rgb2>[^,]+),(?<alpha>[^\)]+)\)$)/i.exec(trimmed);
        if (res != null) {
            const groups = res.groups!;
            const rgb = groups['rgb1'] ?? groups['rgb2']!;
            const ret = Color.parseRgb(rgb!!.trim());
            const alpha = groups['alpha'];
            return alpha == undefined ? ret : ret.withAlpha(Number.parseFloat(alpha.trim()));
        }
        const ret = COLORS_BY_NAME[trimmed.toLowerCase()];
        if (ret == undefined) {
            throw new RangeError(`Color ${trimmed} not found`);
        }
        return ret;
    }

    private static parseRgb(rgb: string): Color {
        if (rgb.startsWith('#')) {
            return Color.parseHex(rgb.substring(1));
        }
        const res = /^(?<r>[^,]+),(?<g>[^,]+),(?<b>.+)$/.exec(rgb);
        if (res == null) {
            throw new RangeError(`Failed to parse rgb ${rgb}`);
        }
        const group = res.groups!;
        return new Color(Number.parseFloat(group['r']!) / 255, Number.parseFloat(group['g']!) / 255, Number.parseFloat(group['b']!) / 255);
    }

    add(c: ReadonlyColor) {
        this.r += c.r;
        this.g += c.g;
        this.b += c.b;
        this.a += c.a;
    }

    addMultiplied(c: ReadonlyColor, c2: ReadonlyColor) {
        this.r += c.r * c2.r;
        this.g += c.g * c2.g;
        this.b += c.b * c2.b;
        this.a += c.a * c2.a;
    }

    addScaled(c: ReadonlyColor, f: number) {
        this.r += c.r * f;
        this.g += c.g * f;
        this.b += c.b * f;
        this.a += c.a * f;
    }

    clamp() {
        this.r = this.r > 0 ? Math.min(1, this.r) : 0;
        this.g = this.g > 0 ? Math.min(1, this.g) : 0;
        this.b = this.b > 0 ? Math.min(1, this.b) : 0;
        this.a = this.a > 0 ? Math.min(1, this.a) : 0;
    }

    clone(): Color {
        return new Color(this.r, this.g, this.b, this.a);
    }

    equals(c: ReadonlyColor): boolean {
        return this.r === c.r && this.g === c.g && this.b === c.b && this.a === c.a;
    }

    equalsRgb(c: ReadonlyColor): boolean {
        return this.r === c.r && this.g === c.g && this.b === c.b;
    }

    getClamped(): Color {
        return new Color(
            this.r > 0 ? Math.min(1, this.r) : 0,
            this.g > 0 ? Math.min(1, this.g) : 0,
            this.b > 0 ? Math.min(1, this.b) : 0,
            this.a > 0 ? Math.min(1, this.a) : 0);
    }

    getDifference(c: ReadonlyColor): Color {
        return new Color(this.r - c.r, this.g - c.g, this.b - c.b, this.a - c.a);
    }

    getInverted(): Color {
        return new Color(1 - this.r, 1 - this.g, 1 - this.b, 1 - this.a);
    }

    getMultiplied(c: ReadonlyColor): Color {
        return new Color(this.r * c.r, this.g * c.g, this.b * c.b, this.a * c.a);
    }

    getScaled(f: number): Color {
        return new Color(this.r * f, this.g * f, this.b * f, this.a * f);
    }

    getSum(c: ReadonlyColor): Color {
        return new Color(this.r + c.r, this.g + c.g, this.b + c.b, this.a + c.a);
    }

    getSumMultiplied(c: ReadonlyColor, c2: ReadonlyColor): Color {
        return new Color(this.r + c.r * c2.r, this.g + c.g * c2.g, this.b + c.b * c2.b, this.a + c.a * c2.a);
    }

    getSumScaled(c: ReadonlyColor, f: number): Color {
        return new Color(this.r + c.r * f, this.g + c.g * f, this.b + c.b * f, this.a + c.a * f);
    }

    multiply(c: ReadonlyColor) {
        this.r *= c.r;
        this.g *= c.g;
        this.b *= c.b;
        this.a *= c.a;
    }

    scale(f: number) {
        this.r *= f;
        this.g *= f;
        this.b *= f;
        this.a *= f;
    }

    set(r: number, g: number, b: number, a: number = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    setColor(c: ReadonlyColor) {
        this.r = c.r;
        this.g = c.g;
        this.b = c.b;
        this.a = c.a;
    }

    toHtmlRgb(): string {
        return `rgb(${Math.round(this.r * 255)}, ${Math.round(this.g * 255)}, ${Math.round(this.b * 255)})`;
    }

    toHtmlRgba(): string {
        return `rgba(${Math.round(this.r * 255)}, ${Math.round(this.g * 255)}, ${Math.round(this.b * 255)}, ${this.a})`;
    }

    toString(): string {
        return `Color(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }

    withAlpha(alpha: number): Color {
        return new Color(this.r, this.g, this.b, alpha);
    }

    withHue(h: number): Color {
        return Color.hsv(h, this.saturation, this.maxComponent, this.a);
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

const COLORS_BY_NAME: { [key: string]: Color } = Object.freeze({
    'aliceblue': Color.parseHex('f0f8ff'),
    'antiquewhite': Color.parseHex('faebd7'),
    'aqua': Color.parseHex('00ffff'),
    'aquamarine': Color.parseHex('7fffd4'),
    'azure': Color.parseHex('f0ffff'),
    'beige': Color.parseHex('f5f5dc'),
    'bisque': Color.parseHex('ffe4c4'),
    'black': Color.parseHex('000000'),
    'blanchedalmond': Color.parseHex('ffebcd'),
    'blue': Color.parseHex('0000ff'),
    'blueviolet': Color.parseHex('8a2be2'),
    'brown': Color.parseHex('a52a2a'),
    'burlywood': Color.parseHex('deb887'),
    'cadetblue': Color.parseHex('5f9ea0'),
    'chartreuse': Color.parseHex('7fff00'),
    'chocolate': Color.parseHex('d2691e'),
    'coral': Color.parseHex('ff7f50'),
    'cornflowerblue': Color.parseHex('6495ed'),
    'cornsilk': Color.parseHex('fff8dc'),
    'crimson': Color.parseHex('dc143c'),
    'cyan': Color.parseHex('00ffff'),
    'darkblue': Color.parseHex('00008b'),
    'darkcyan': Color.parseHex('008b8b'),
    'darkgoldenrod': Color.parseHex('b8860b'),
    'darkgray': Color.parseHex('a9a9a9'),
    'darkgreen': Color.parseHex('006400'),
    'darkgrey': Color.parseHex('a9a9a9'),
    'darkkhaki': Color.parseHex('bdb76b'),
    'darkmagenta': Color.parseHex('8b008b'),
    'darkolivegreen': Color.parseHex('556b2f'),
    'darkorange': Color.parseHex('ff8c00'),
    'darkorchid': Color.parseHex('9932cc'),
    'darkred': Color.parseHex('8b0000'),
    'darksalmon': Color.parseHex('e9967a'),
    'darkseagreen': Color.parseHex('8fbc8f'),
    'darkslateblue': Color.parseHex('483d8b'),
    'darkslategray': Color.parseHex('2f4f4f'),
    'darkslategrey': Color.parseHex('2f4f4f'),
    'darkturquoise': Color.parseHex('00ced1'),
    'darkviolet': Color.parseHex('9400d3'),
    'deeppink': Color.parseHex('ff1493'),
    'deepskyblue': Color.parseHex('00bfff'),
    'dimgray': Color.parseHex('696969'),
    'dimgrey': Color.parseHex('696969'),
    'dodgerblue': Color.parseHex('1e90ff'),
    'firebrick': Color.parseHex('b22222'),
    'floralwhite': Color.parseHex('fffaf0'),
    'forestgreen': Color.parseHex('228b22'),
    'fuchsia': Color.parseHex('ff00ff'),
    'gainsboro': Color.parseHex('dcdcdc'),
    'ghostwhite': Color.parseHex('f8f8ff'),
    'gold': Color.parseHex('ffd700'),
    'goldenrod': Color.parseHex('daa520'),
    'gray': Color.parseHex('808080'),
    'green': Color.parseHex('008000'),
    'greenyellow': Color.parseHex('adff2f'),
    'grey': Color.parseHex('808080'),
    'honeydew': Color.parseHex('f0fff0'),
    'hotpink': Color.parseHex('ff69b4'),
    'indianred': Color.parseHex('cd5c5c'),
    'indigo': Color.parseHex('4b0082'),
    'ivory': Color.parseHex('fffff0'),
    'khaki': Color.parseHex('f0e68c'),
    'lavender': Color.parseHex('e6e6fa'),
    'lavenderblush': Color.parseHex('fff0f5'),
    'lawngreen': Color.parseHex('7cfc00'),
    'lemonchiffon': Color.parseHex('fffacd'),
    'lightblue': Color.parseHex('add8e6'),
    'lightcoral': Color.parseHex('f08080'),
    'lightcyan': Color.parseHex('e0ffff'),
    'lightgoldenrodyellow': Color.parseHex('fafad2'),
    'lightgray': Color.parseHex('d3d3d3'),
    'lightgreen': Color.parseHex('90ee90'),
    'lightgrey': Color.parseHex('d3d3d3'),
    'lightpink': Color.parseHex('ffb6c1'),
    'lightsalmon': Color.parseHex('ffa07a'),
    'lightseagreen': Color.parseHex('20b2aa'),
    'lightskyblue': Color.parseHex('87cefa'),
    'lightslategray': Color.parseHex('778899'),
    'lightslategrey': Color.parseHex('778899'),
    'lightsteelblue': Color.parseHex('b0c4de'),
    'lightyellow': Color.parseHex('ffffe0'),
    'lime': Color.parseHex('00ff00'),
    'limegreen': Color.parseHex('32cd32'),
    'linen': Color.parseHex('faf0e6'),
    'magenta': Color.parseHex('ff00ff'),
    'maroon': Color.parseHex('800000'),
    'mediumaquamarine': Color.parseHex('66cdaa'),
    'mediumblue': Color.parseHex('0000cd'),
    'mediumorchid': Color.parseHex('ba55d3'),
    'mediumpurple': Color.parseHex('9370db'),
    'mediumseagreen': Color.parseHex('3cb371'),
    'mediumslateblue': Color.parseHex('7b68ee'),
    'mediumspringgreen': Color.parseHex('00fa9a'),
    'mediumturquoise': Color.parseHex('48d1cc'),
    'mediumvioletred': Color.parseHex('c71585'),
    'midnightblue': Color.parseHex('191970'),
    'mintcream': Color.parseHex('f5fffa'),
    'mistyrose': Color.parseHex('ffe4e1'),
    'moccasin': Color.parseHex('ffe4b5'),
    'navajowhite': Color.parseHex('ffdead'),
    'navy': Color.parseHex('000080'),
    'oldlace': Color.parseHex('fdf5e6'),
    'olive': Color.parseHex('808000'),
    'olivedrab': Color.parseHex('6b8e23'),
    'orange': Color.parseHex('ffa500'),
    'orangered': Color.parseHex('ff4500'),
    'orchid': Color.parseHex('da70d6'),
    'palegoldenrod': Color.parseHex('eee8aa'),
    'palegreen': Color.parseHex('98fb98'),
    'paleturquoise': Color.parseHex('afeeee'),
    'palevioletred': Color.parseHex('db7093'),
    'papayawhip': Color.parseHex('ffefd5'),
    'peachpuff': Color.parseHex('ffdab9'),
    'peru': Color.parseHex('cd853f'),
    'pink': Color.parseHex('ffc0cb'),
    'plum': Color.parseHex('dda0dd'),
    'powderblue': Color.parseHex('b0e0e6'),
    'purple': Color.parseHex('800080'),
    'red': Color.parseHex('ff0000'),
    'rosybrown': Color.parseHex('bc8f8f'),
    'royalblue': Color.parseHex('4169e1'),
    'saddlebrown': Color.parseHex('8b4513'),
    'salmon': Color.parseHex('fa8072'),
    'sandybrown': Color.parseHex('f4a460'),
    'seagreen': Color.parseHex('2e8b57'),
    'seashell': Color.parseHex('fff5ee'),
    'sienna': Color.parseHex('a0522d'),
    'silver': Color.parseHex('c0c0c0'),
    'skyblue': Color.parseHex('87ceeb'),
    'slateblue': Color.parseHex('6a5acd'),
    'slategray': Color.parseHex('708090'),
    'slategrey': Color.parseHex('708090'),
    'snow': Color.parseHex('fffafa'),
    'springgreen': Color.parseHex('00ff7f'),
    'steelblue': Color.parseHex('4682b4'),
    'tan': Color.parseHex('d2b48c'),
    'teal': Color.parseHex('008080'),
    'thistle': Color.parseHex('d8bfd8'),
    'tomato': Color.parseHex('ff6347'),
    'turquoise': Color.parseHex('40e0d0'),
    'violet': Color.parseHex('ee82ee'),
    'wheat': Color.parseHex('f5deb3'),
    'white': Color.parseHex('ffffff'),
    'whitesmoke': Color.parseHex('f5f5f5'),
    'yellow': Color.parseHex('ffff00'),
    'yellowgreen': Color.parseHex('9acd32')
});
