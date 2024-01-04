import { ReadonlyColor } from "core";
import { ColorStops, ColorStopsArray, ColorStopsData } from "../render/color-stops";
import { PaintStyle } from "./paint-style";

export interface GradientStyleData extends ColorStopsData {
}

export abstract class GradientStyle extends PaintStyle {

    private readonly _colorStops: ColorStops;

    private modified = false;
    private gradient: CanvasGradient | undefined;

    get colorStops(): ColorStopsArray {
        return this._colorStops.stops;
    }

    constructor(data: GradientStyleData) {
        super();
        this._colorStops = new ColorStops(data);
        this._colorStops.onModify.subscribe(() => this.setModified());
    }

    removeColorStop(offset: number) {
        this._colorStops.removeAt(offset);
    }

    setColorStop(color: ReadonlyColor, offset: number) {
        this._colorStops.set(color, offset);
    }

    setColorStops(...data: Array<{ color: ReadonlyColor; offset: number; }>) {
        this._colorStops.setAll(data);
    }

    getStyle(context: CanvasRenderingContext2D): string | CanvasGradient | CanvasPattern {
        if (this.modified || this.gradient == undefined) {
            this.gradient = this.createGradient(context);
            this._colorStops.updateGradient(this.gradient);
            this.modified = false;
        }
        return this.gradient;
    }

    protected onDispose() {
    }

    protected setModified() {
        this.modified = true;
    }

    protected abstract createGradient(context: CanvasRenderingContext2D): CanvasGradient;
}