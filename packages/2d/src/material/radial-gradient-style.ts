import { ReadonlyVector2d, Vector2d } from "@pluto/core";
import { GradientStyle, GradientStyleData } from "./gradient-style";
import { PaintStyle } from "./paint-style";

export interface RadialGradientStyleData extends GradientStyleData {

    readonly startPosition?: ReadonlyVector2d;
    readonly startRadius?: number;
    readonly endPosition?: ReadonlyVector2d;
    readonly endRadius: number;
}

export class RadialGradientStyle extends GradientStyle {

    private readonly _startPosition: Vector2d;
    private readonly _endPosition: Vector2d;

    private _startRadius: number;
    private _endRadius: number;

    get endPosition(): ReadonlyVector2d {
        return this._endPosition;
    }

    set endPosition(p: ReadonlyVector2d) {
        this._endPosition.setVector(p);
        this.setModified();
    }

    get endRadius(): number {
        return this._endRadius;
    }

    set endRadius(r: number) {
        if (this._endRadius !== r) {
            this._endRadius = r;
            this.setModified();
        }
    }

    get startPosition(): ReadonlyVector2d {
        return this._startPosition;
    }

    set startPosition(p: ReadonlyVector2d) {
        this._startPosition.setVector(p);
        this.setModified();
    }

    get startRadius(): number {
        return this._startRadius;
    }

    set startRadius(r: number) {
        if (this._startRadius !== r) {
            this._startRadius = r;
            this.setModified();
        }
    }

    constructor(data: RadialGradientStyleData) {
        super(data);
        this._startPosition = data.startPosition?.clone() ?? new Vector2d(0, 0);
        this._endPosition = data.endPosition?.clone() ?? this._startPosition.clone();
        this._startRadius = data.startRadius ?? 0;
        this._endRadius = data.endRadius;
    }

    clone(): PaintStyle {
        return new RadialGradientStyle({
            startPosition: this._startPosition,
            startRadius: this._startRadius,
            endPosition: this._endPosition,
            endRadius: this._endRadius,
            colorStops: this.colorStops
        });
    }

    cloneAt(origin: ReadonlyVector2d): PaintStyle {
        return new RadialGradientStyle({
            startPosition: this._startPosition.getSum(origin),
            startRadius: this._startRadius,
            endPosition: this._endPosition.getSum(origin),
            endRadius: this._endRadius,
            colorStops: this.colorStops
        });
    }

    protected createGradient(context: CanvasRenderingContext2D): CanvasGradient {
        return context.createRadialGradient(this._startPosition.x, -this._startPosition.y, this._startRadius, this._endPosition.x, -this._endPosition.y, this._endRadius);
    }
}