import { RenderingContext2d } from "../../render/rendering-context2d";
import { ReadonlyColor, Vector2 } from "projects/core/src/public-api";
import { Background } from "./background";
import { ColorStops, ColorStopsData } from "../../render/color-stops";

export interface GradientBackgroundData extends ColorStopsData {
    readonly alpha?: number;
}

export abstract class GradientBackground implements Background {

    alpha: number;

    readonly hasReferences = false

    private colorStops: ColorStops;
    private gradient: CanvasGradient | undefined;
    private modified = false;
    private transparent = false;
    private viewportSize = new Vector2(0, 0);

    constructor(data: GradientBackgroundData) {
        this.alpha = data.alpha == undefined ? 1 : data.alpha;
        this.colorStops = new ColorStops(data);
        this.colorStops.onModify.subscribe(() => this.setModified());
    }

    addReference(_: any): void {
    }

    releaseReference(_: any): void {
    }

    removeColorStop(offset: number) {
        this.colorStops.removeAt(offset);
    }

    render(context: RenderingContext2d) {
        context.renderSafely(ctx => {
            if (this.transparent || this.alpha < 1) {
                ctx.clear();
            }
            ctx.context.globalAlpha *= this.alpha;
            this.updateAndUseGradient(ctx);
            ctx.fill();
        });
    }

    setColorStop(color: ReadonlyColor, offset: number) {
        this.colorStops.set(color, offset);
    }

    setColorStops(...data: Array<{ color: ReadonlyColor; offset: number; }>) {
        this.colorStops.setAll(data);
    }

    private updateAndUseGradient(context: RenderingContext2d) {
        if (this.gradient == undefined || this.modified || !this.viewportSize.equals(context.viewportSize)) {
            this.gradient = this.createGradient(context);
            this.colorStops.updateGradient(this.gradient);
            this.viewportSize.setVector(context.viewportSize);
            this.transparent = this.colorStops.isTransparent();
            this.modified = false;
        }
        context.context.fillStyle = this.gradient;
    }

    protected abstract createGradient(context: RenderingContext2d): CanvasGradient;

    protected setModified() {
        this.modified = true;
    }
}