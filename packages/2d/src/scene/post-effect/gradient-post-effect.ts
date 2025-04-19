import { ReadonlyColor, Vector2d } from "@pluto/core";
import { ColorStops, ColorStopsArray } from "../../material/color-stops";
import { Blend2dOperation } from "../../render";
import { PostEffect } from "./post-effect";
import { RenderingContext2d } from "../../component/rendering-context-2d";

export interface GradientPostEffectData {
    alpha?: number;
    blendOperation?: Blend2dOperation;
    colorStops: ColorStopsArray;
}

export abstract class GradientPostEffect extends PostEffect {

    readonly hasReferences: boolean = false;

    alpha: number;
    blendOperation: Blend2dOperation;

    private colorStops: ColorStops;
    private gradient: CanvasGradient | undefined;
    private modified = false;
    private viewportSize = new Vector2d(0, 0);

    constructor(data: Readonly<GradientPostEffectData>) {
        super();
        this.alpha = data.alpha ?? 1;
        this.blendOperation = data.blendOperation ?? 'source-over';
        this.colorStops = new ColorStops(data.colorStops);
    }

    removeColorStop(offset: number) {
        this.colorStops.removeAt(offset);
        this.setModified();
    }

    render(): void {
        RenderingContext2d.renderSafely(ctx => {
            ctx.canvasRenderingContext.globalAlpha *= this.alpha;
            ctx.canvasRenderingContext.globalCompositeOperation = this.blendOperation;
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