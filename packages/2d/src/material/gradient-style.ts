import { ReadonlyColor } from "@pluto/core";
import { PaintStyle } from "./paint-style";
import { ColorStops, ColorStopsArray } from "./color-stops";
import { RenderingContext2d } from "../component/rendering-context-2d";

export interface GradientStyleData {
    colorStops: ColorStopsArray;
}

export abstract class GradientStyle extends PaintStyle {

    private _colorStops: ColorStops;

    private modified = false;
    private gradient: CanvasGradient | undefined;

    get colorStops(): ColorStopsArray {
        return this._colorStops.stops;
    }

    constructor(data: GradientStyleData) {
        super();
        this._colorStops = new ColorStops(data.colorStops);
    }

    getStyle(): string | CanvasGradient | CanvasPattern {
        if (this.modified || this.gradient == undefined) {
            this.gradient = this.createGradient(RenderingContext2d.currentCanvasRenderingContext2d);
            this._colorStops.updateGradient(this.gradient);
            this.modified = false;
        }
        return this.gradient;
    }

    removeColorStop(offset: number) {
        this._colorStops.removeAt(offset);
        this.setModified();
    }

    setColorStop(color: ReadonlyColor, offset: number) {
        this._colorStops.set(color, offset);
        this.setModified();
    }

    setColorStops(...data: ColorStopsArray) {
        this._colorStops.setAll(data);
        this.setModified();
    }

    protected abstract createGradient(context: CanvasRenderingContext2D): CanvasGradient;

    protected onDelete(): void {
    }

    protected setModified() {
        this.modified = true;
    }
}