import { ReadonlyVector2d, Vector2d } from "@pluto/core";
import { GradientBackground, GradientBackgroundData } from "./gradient-background";
import { RenderingContext2d } from "../../component/rendering-context-2d";

export interface LinearGradientBackgroundData extends GradientBackgroundData {
    readonly direction: ReadonlyVector2d;
}

export class LinearGradientBackground extends GradientBackground {

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

    constructor(data: LinearGradientBackgroundData) {
        super(data);
        this._direction = data.direction.clone();
    }

    protected override createGradient(context: RenderingContext2d): CanvasGradient {
        return context.createFullscreenLinearGradient(this._direction);

    }
}