export class CompositeOperation {

    private constructor(readonly value: GlobalCompositeOperation) {
    }

    static readonly NORMAL = new CompositeOperation('source-over');
    static readonly MULTIPLY = new CompositeOperation('multiply');
    static readonly OVERLAY = new CompositeOperation('overlay');
    static readonly DARKEN = new CompositeOperation('darken');
    static readonly LIGHTEN = new CompositeOperation('lighten');
    static readonly SCREEN = new CompositeOperation('screen');

    static readonly HUE = new CompositeOperation('hue');
    static readonly SATURATION = new CompositeOperation('saturation');
    static readonly COLOR = new CompositeOperation('color');
    static readonly LUMINOSITY = new CompositeOperation('luminosity');

    static readonly XOR = new CompositeOperation('xor');
    static readonly LIGHTER = new CompositeOperation('lighter');

    // color-dodge, color-burn,
    // hard-light, soft-light, difference, exclusion

    // clear, copy, source-over, destination-over, source-in, destination-in, source-out, destination-out, source-atop,
    // destination-atop, plus-darker, plus-lighter
}