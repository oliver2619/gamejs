export class Blend2dOperation {

    private constructor(readonly value: GlobalCompositeOperation) {
    }

    static readonly NORMAL = new Blend2dOperation('source-over');
    static readonly PRESERVE_ALPHA = new Blend2dOperation('source-atop');
    static readonly BACKGROUND = new Blend2dOperation('destination-over');
    static readonly MULTIPLY = new Blend2dOperation('multiply');
    static readonly OVERLAY = new Blend2dOperation('overlay');
    static readonly DARKEN = new Blend2dOperation('darken');
    static readonly LIGHTEN = new Blend2dOperation('lighten');
    static readonly SCREEN = new Blend2dOperation('screen');

    static readonly HUE = new Blend2dOperation('hue');
    static readonly SATURATION = new Blend2dOperation('saturation');
    static readonly COLOR = new Blend2dOperation('color');
    static readonly LUMINOSITY = new Blend2dOperation('luminosity');

    static readonly XOR = new Blend2dOperation('xor');
    static readonly LIGHTER = new Blend2dOperation('lighter');

    static readonly HARD_LIGHT = new Blend2dOperation('hard-light');
    static readonly SOFT_LIGHT = new Blend2dOperation('soft-light');

    // color-dodge, color-burn,
    // difference, exclusion

    // clear, copy, source-in, destination-in, source-out, destination-out,
    // destination-atop, plus-darker, plus-lighter
}