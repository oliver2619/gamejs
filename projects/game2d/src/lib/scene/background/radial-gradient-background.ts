import { RenderingContext2d } from "../../render/rendering-context2d";
import { ReadonlyVector2, Vector2 } from "projects/core/src/public-api";
import { GradientBackground, GradientBackgroundData } from "./gradient-background";

export interface RadialGradientBackgroundData extends GradientBackgroundData {
    readonly origin?: ReadonlyVector2;
}

export class RadialGradientBackground extends GradientBackground {

    readonly origin: Vector2;

    constructor(data: RadialGradientBackgroundData) {
        super(data);
        this.origin = data.origin == undefined ? new Vector2(0.5, 0.5) : data.origin.clone();
        this.origin.onModify.subscribe(_ => this.setModified());
    }

    protected createGradient(context: RenderingContext2d): CanvasGradient {
        const p = context.viewportSize;
        return context.context.createRadialGradient(this.origin.x * p.x, (1 - this.origin.y) * p.y, 0, p.x * 0.5, p.y * 0.5, context.viewportSize.length * .5);
    }
}