import { ReadonlyVector2, Vector2 } from "core";
import { RenderingContext2d } from "../../render/rendering-context2d";
import { GradientPostEffect, GradientPostEffectData } from "./gradient-post-effect";

export interface RadialGradientPostEffectData extends GradientPostEffectData {
    readonly origin?: ReadonlyVector2;
}

export class RadialGradientPostEffect extends GradientPostEffect {

    readonly origin: Vector2;

    constructor(data: RadialGradientPostEffectData) {
        super(data);
        this.origin = data.origin == undefined ? new Vector2(0.5, 0.5) : data.origin.clone();
        this.origin.onModify.subscribe(_ => this.setModified());
    }

    protected createGradient(context: RenderingContext2d): CanvasGradient {
        const p = context.viewportSize;
        return context.context.createRadialGradient(this.origin.x * p.x, (1 - this.origin.y) * p.y, 0, p.x * 0.5, p.y * 0.5, context.viewportSize.length * .5);
    }

}