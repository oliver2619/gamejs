import { ReadonlyVector2d, Vector2d } from "@pluto/core";
import { GradientPostEffect, GradientPostEffectData } from "./gradient-post-effect";
import { RenderingContext2d } from "../../component/rendering-context-2d";

export interface RadialGradientPostEffectData extends GradientPostEffectData {
    origin?: ReadonlyVector2d;
}

export class RadialGradientPostEffect extends GradientPostEffect {

    private readonly _origin: Vector2d;

    get origin(): ReadonlyVector2d {
        return this._origin;
    }

    set origin(o: ReadonlyVector2d) {
        if (!this._origin.equals(o)) {
            this._origin.setVector(o);
            this.setModified();
        }
    }

    constructor(data: Readonly<RadialGradientPostEffectData>) {
        super(data);
        this._origin = data.origin?.clone() ?? new Vector2d(0.5, 0.5);
    }

    protected createGradient(context: RenderingContext2d): CanvasGradient {
        const p = context.viewport.size;
        return context.canvasRenderingContext.createRadialGradient(this._origin.x * p.x, (1 - this._origin.y) * p.y, 0, p.x * 0.5, p.y * 0.5, p.length * .5);
    }

}