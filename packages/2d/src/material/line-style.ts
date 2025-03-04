import { RenderingContext2d } from "../component/rendering-context-2d";

export interface LineStyleData {
    lineCap?: CanvasLineCap | undefined;
    lineDashOffset?: number | undefined;
    lineJoin?: CanvasLineJoin | undefined;
    lineWidth?: number | undefined;
    miterLimit?: number | undefined;
    lineDash?: number[] | undefined;
}

export class LineStyle {

    lineCap: CanvasLineCap | undefined;
    lineDashOffset: number | undefined;
    lineJoin: CanvasLineJoin | undefined;
    miterLimit: number | undefined;
    lineWidth: number | undefined;

    private _lineDash: number[] | undefined;

    get lineDash(): number[] | undefined {
        return this._lineDash?.slice(0);
    }

    set lineDash(lineDash: number[] | undefined) {
        this._lineDash = lineDash?.slice(0);
    }

    constructor(data?: Readonly<LineStyleData>) {
        this.lineCap = data?.lineCap;
        this._lineDash = data?.lineDash?.slice(0) ?? [];
        this.lineDashOffset = data?.lineDashOffset;
        this.lineJoin = data?.lineJoin;
        this.lineWidth = data?.lineWidth ?? 1;
        this.miterLimit = data?.miterLimit;
    }

    static newInstance(): LineStyle {
        return new LineStyle({
            lineCap: 'butt',
            lineDash: [],
            lineDashOffset: 0,
            lineJoin: 'miter',
            lineWidth: 1,
            miterLimit: 10
        });
    }

    clone(): LineStyle {
        return new LineStyle({
            lineCap: this.lineCap,
            lineDash: this._lineDash,
            lineDashOffset: this.lineDashOffset,
            lineJoin: this.lineJoin,
            lineWidth: this.lineWidth,
            miterLimit: this.miterLimit
        });
    }

    use() {
        const context = RenderingContext2d.currentCanvasRenderingContext2d;
        if (this.lineCap != undefined) {
            context.lineCap = this.lineCap;
        }
        if (this.lineWidth != undefined) {
            context.lineWidth = this.lineWidth;
        }
        if (this.lineDashOffset != undefined) {
            context.lineDashOffset = this.lineDashOffset;
        }
        if (this.lineJoin != undefined) {
            context.lineJoin = this.lineJoin;
        }
        if (this.miterLimit != undefined) {
            context.miterLimit = this.miterLimit;
        }
        if (this._lineDash != undefined) {
            context.setLineDash(this._lineDash);
        }
    }
}