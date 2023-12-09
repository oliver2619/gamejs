export interface LineStyleData {

    readonly lineCap?: CanvasLineCap;
    readonly lineDashOffset?: number;
    readonly lineJoin?: CanvasLineJoin;
    readonly lineWidth?: number;
    readonly miterLimit?: number;
    readonly lineDash?: number[];

}

export class LineStyle {

    lineCap: CanvasLineCap;
    lineDash: number[];
    lineDashOffset: number;
    lineJoin: CanvasLineJoin;
    miterLimit: number;

    private _lineWidth: number;

    get lineWidth(): number {
        return this._lineWidth;
    }

    set lineWidth(w: number) {
        if (this._lineWidth !== w) {
            this._lineWidth = w;
        }
    }

    constructor(data?: LineStyleData) {
        this.lineCap = data == undefined || data.lineCap == undefined ? 'butt' : data.lineCap;
        this.lineDash = data == undefined || data.lineDash == undefined ? [] : data.lineDash.slice(0);
        this.lineDashOffset = data == undefined || data.lineDashOffset == undefined ? 0 : data.lineDashOffset;
        this.lineJoin = data == undefined || data.lineJoin == undefined ? 'miter' : data.lineJoin;
        this._lineWidth = data == undefined || data.lineWidth == undefined ? 1 : data.lineWidth;
        this.miterLimit = data == undefined || data.miterLimit == undefined ? 10 : data.miterLimit;
    }

    clone(): LineStyle {
        return new LineStyle({ lineCap: this.lineCap, lineDash: this.lineDash, lineDashOffset: this.lineDashOffset, lineJoin: this.lineJoin, lineWidth: this.lineWidth, miterLimit: this.miterLimit });
    }

    use(context: CanvasRenderingContext2D) {
        context.lineCap = this.lineCap;
        context.lineDashOffset = this.lineDashOffset;
        context.lineJoin = this.lineJoin;
        context.miterLimit = this.miterLimit;
        context.lineWidth = this._lineWidth;
        context.setLineDash(this.lineDash);
    }
}