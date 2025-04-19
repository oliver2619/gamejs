import { PatternRepetition } from "./pattern-style";

export type PaintStyleTypeJson = 'color' | 'linear' | 'radial' | 'pattern';

export interface LineStyleJson {
    lineCap?: CanvasLineCap;
    lineDashOffset?: number;
    lineJoin?: CanvasLineJoin;
    lineWidth?: number;
    miterLimit?: number;
    lineDash?: number[];
}

export interface PaintStyleJson {
    type: PaintStyleTypeJson;
}

export interface ColorStyleJson extends PaintStyleJson {
    type: 'color';
    color: string;
}

export interface GradientStyleJson extends PaintStyleJson {
    stops: Array<[number, string]>;
}

export interface LinearGradientStyleJson extends GradientStyleJson {
    type: 'linear';
    start: [number, number];
    end: [number, number];
}

export interface RadialGradientStyleJson extends GradientStyleJson {
    type: 'radial';
    start: [number, number, number];
    end: [number, number, number];
}

export interface PatternStyleJson extends PaintStyleJson {
    type: 'pattern';
    image: string;
    repetition?: PatternRepetition;
    offset?: [number, number];
    rotate?: number;
    scale?: number;
}

export interface Material2dJson {
    alpha?: number;
    fill?: string;
    stroke?: string;
    line?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
}

export interface Material2dCacheJson {
    readonly version: 1;
    lineStyles: { [key: string]: LineStyleJson };
    paintStyles: { [key: string]: PaintStyleJson };
    materials: { [key: string]: Material2dJson };
}