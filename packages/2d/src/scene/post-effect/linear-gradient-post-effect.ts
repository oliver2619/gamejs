import { ReadonlyVector2d, Vector2d } from "@pluto/core";
import { GradientPostEffect, GradientPostEffectData } from "./gradient-post-effect";
import { RenderingContext2d } from "../../component/rendering-context-2d";

export interface LinearGradientPostEffectData extends GradientPostEffectData {
    direction: ReadonlyVector2d;
}

export class LinearGradientPostEffect extends GradientPostEffect {

    private readonly _direction: Vector2d;

    get direction(): ReadonlyVector2d {
        return this._direction;
    }

    set direction(d: ReadonlyVector2d) {
        if (!this._direction.equals(d)) {
            this._direction.setVector(d);
            this.setModified();
        }
    }

    constructor(data: Readonly<LinearGradientPostEffectData>) {
        super(data);
        this._direction = data.direction.clone();
    }

    protected createGradient(context: RenderingContext2d): CanvasGradient {
        return context.createFullscreenLinearGradient(this._direction);
    }
}