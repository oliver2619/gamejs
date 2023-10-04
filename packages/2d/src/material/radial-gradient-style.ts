import { ReadonlyVector2, Vector2 } from "core/src/index";
import { GradientStyle, GradientStyleData } from "./gradient-style";
import { PaintStyle } from "./paint-style";

export interface RadialGradientStyleData extends GradientStyleData {

    readonly startPosition?: ReadonlyVector2;
    readonly startRadius?: number;
    readonly endPosition?: ReadonlyVector2;
    readonly endRadius: number;
}

export class RadialGradientStyle extends GradientStyle {

    readonly startPosition: Vector2;
    readonly endPosition: Vector2;

    private _startRadius: number;
    private _endRadius: number;

    get startRadius(): number {
        return this._startRadius;
    }

    set startRadius(r: number) {
        if (this._startRadius !== r) {
            this._startRadius = r;
            this.setModified();
        }
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

    constructor(data: RadialGradientStyleData) {
        super(data);
        this.startPosition = data.startPosition == undefined ? new Vector2(0, 0) : data.startPosition.clone();
        this.endPosition = data.endPosition == undefined ? this.startPosition.clone() : data.endPosition.clone();
        this._startRadius = data.startRadius == undefined ? 0 : data.startRadius;
        this._endRadius = data.endRadius;
        this.startPosition.onModify.subscribe(() => this.setModified());
        this.endPosition.onModify.subscribe(() => this.setModified());
    }

    clone(): PaintStyle {
        return new RadialGradientStyle({ startPosition: this.startPosition, startRadius: this._startRadius, endPosition: this.endPosition, endRadius: this._endRadius, stops: this.colorStops });
    }

    protected createGradient(context: CanvasRenderingContext2D): CanvasGradient {
        return context.createRadialGradient(this.startPosition.x, -this.startPosition.y, this._startRadius, this.endPosition.x, -this.endPosition.y, this._endRadius);
    }
}