import { ReadonlyVector2, Vector2 } from "projects/core/src/public-api";
import { GradientStyle, GradientStyleData } from "./gradient-style";
import { PaintStyle } from "./paint-style";

export interface LinearGradientStyleData extends GradientStyleData {

    readonly start: ReadonlyVector2;
    readonly end: ReadonlyVector2;
}

export class LinearGradientStyle extends GradientStyle {

    readonly start: Vector2;
    readonly end: Vector2;

    constructor(data: LinearGradientStyleData) {
        super(data);
        this.start = data.start.clone();
        this.end = data.end.clone();
        this.start.onModify.subscribe(() => this.setModified());
        this.end.onModify.subscribe(() => this.setModified());
    }

    clone(): PaintStyle {
        return new LinearGradientStyle({ start: this.start, end: this.end, stops: this.colorStops });
    }

    protected createGradient(context: CanvasRenderingContext2D): CanvasGradient {
        return context.createLinearGradient(this.start.x, -this.start.y, this.end.x, -this.end.y);
    }
}