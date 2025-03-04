import { ReadonlyVector2d, Vector2d } from "@pluto/core";
import { GradientStyle, GradientStyleData } from "./gradient-style";
import { PaintStyle } from "./paint-style";

export interface LinearGradientStyleData extends GradientStyleData {
    start: ReadonlyVector2d;
    end: ReadonlyVector2d;
}

export class LinearGradientStyle extends GradientStyle {

    private _start: Vector2d;
    private _end: Vector2d;

    get end(): ReadonlyVector2d {
        return this._end;
    }

    set end(e: ReadonlyVector2d) {
        this._end.setVector(e);
        this.setModified();
    }

    get start(): ReadonlyVector2d {
        return this._start;
    }

    set start(s: ReadonlyVector2d) {
        this._start.setVector(s);
        this.setModified();
    }

    constructor(data: LinearGradientStyleData) {
        super(data);
        this._start = data.start.clone();
        this._end = data.end.clone();
    }

    clone(): PaintStyle {
        return new LinearGradientStyle({ start: this._start, end: this._end, colorStops: this.colorStops });
    }

    cloneAt(origin: ReadonlyVector2d): PaintStyle {
        return new LinearGradientStyle({ start: this._start.getSum(origin), end: this._end.getSum(origin), colorStops: this.colorStops });
    }

    protected override createGradient(context: CanvasRenderingContext2D): CanvasGradient {
        return context.createLinearGradient(this._start.x, -this._start.y, this._end.x, -this._end.y);
    }
}