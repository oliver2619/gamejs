import { CompositeOperation } from "2d/src/index";
import { ColorStops, ColorStopsData } from "2d/src/render/color-stops";
import { RenderingContext2d } from "2d/src/render/rendering-context2d";
import { ReadonlyColor, Vector2 } from "core/src/index";
import { PostEffect } from "./post-effect";

export interface GradientPostEffectData extends ColorStopsData {

    readonly alpha?: number;
    readonly compositeOperation?: CompositeOperation;
}

export abstract class GradientPostEffect implements PostEffect {

    readonly hasReferences: boolean = false;

    alpha: number;
    compositeOperation: CompositeOperation;

    private colorStops: ColorStops;
    private gradient: CanvasGradient | undefined;
    private modified = false;
    private viewportSize = new Vector2(0, 0);

    constructor(data: GradientPostEffectData) {
        this.alpha = data.alpha == undefined ? 1 : data.alpha;
        this.compositeOperation = data.compositeOperation == undefined ? CompositeOperation.NORMAL : data.compositeOperation;
        this.colorStops = new ColorStops(data);
    }

    addReference(holder: any): void {
    }

    releaseReference(holder: any): void {
    }

    removeColorStop(offset: number) {
        this.colorStops.removeAt(offset);
    }

    render(context: RenderingContext2d): void {
        context.renderSafely(ctx => {
            ctx.context.globalAlpha *= this.alpha;
            ctx.context.globalCompositeOperation = this.compositeOperation.value;
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
            this.modified = false;
        }
        context.context.fillStyle = this.gradient;
    }

    protected abstract createGradient(context: RenderingContext2d): CanvasGradient;

    protected setModified() {
        this.modified = true;
    }
}