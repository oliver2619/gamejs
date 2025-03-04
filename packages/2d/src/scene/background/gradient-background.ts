import { ReadonlyColor, Vector2d } from "@pluto/core";
import { ColorStops, ColorStopsData } from "../../material/color-stops";
import { Background } from "./background";
import { RenderingContext2d } from "../../component/rendering-context-2d";

export interface GradientBackgroundData {
    alpha?: number;
    colorStops: ColorStopsData;
}

export abstract class GradientBackground extends Background {

    alpha: number;

    private colorStops: ColorStops;
    private gradient: CanvasGradient | undefined;
    private modified = false;
    private transparent = false;
    private viewportSize = new Vector2d(0, 0);

    constructor(data: Readonly<GradientBackgroundData>) {
        super();
        this.alpha = data.alpha == undefined ? 1 : data.alpha;
        this.colorStops = new ColorStops(data.colorStops);
    }

    removeColorStop(offset: number) {
        this.colorStops.removeAt(offset);
        this.setModified();
    }

    render(): void {
        RenderingContext2d.renderSafely(ctx => {
            if (this.transparent || this.alpha < 1) {
                ctx.clear();
            }
            ctx.canvasRenderingContext.globalAlpha *= this.alpha;
            this.updateAndUseGradient(ctx);
            ctx.fill();
        });
    }

    setColorStop(color: ReadonlyColor, offset: number) {
        this.colorStops.set(color, offset);
        this.setModified();
    }

    setColorStops(...data: Array<{ color: ReadonlyColor; offset: number; }>) {
        this.colorStops.setAll(data);
        this.setModified();
    }

    private updateAndUseGradient(context: RenderingContext2d) {
        if (this.gradient == undefined || this.modified || !this.viewportSize.equals(context.viewport.size)) {
            this.gradient = this.createGradient(context);
            this.colorStops.updateGradient(this.gradient);
            this.viewportSize.setVector(context.viewport.size);
            this.transparent = this.colorStops.isTransparent();
            this.modified = false;
        }
        context.canvasRenderingContext.fillStyle = this.gradient;
    }

    protected abstract createGradient(context: RenderingContext2d): CanvasGradient;

    protected setModified() {
        this.modified = true;
    }

    protected onDelete(): void {
    }
}