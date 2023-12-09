import { ReadonlyVector2, Vector2 } from "projects/core/src/public-api";
import { RenderingContext2d } from "../../render/rendering-context2d";
import { GradientBackground, GradientBackgroundData } from "./gradient-background";

export interface LinearGradientBackgroundData extends GradientBackgroundData {

    readonly direction: ReadonlyVector2;
}

export class LinearGradientBackground extends GradientBackground {

    readonly direction: Vector2;

    constructor(data: LinearGradientBackgroundData) {
        super(data);
        this.direction = data.direction.clone();
        this.direction.onModify.subscribe(_ => this.setModified());
    }

    protected createGradient(context: RenderingContext2d): CanvasGradient {
        const p11 = new Vector2(0, 0);
        const p21 = new Vector2(context.viewportSize.x - 1, 0);
        const p12 = new Vector2(0, context.viewportSize.y - 1);
        const p22 = new Vector2(context.viewportSize.x - 1, context.viewportSize.y - 1);
        const dir = this.direction.getNormalized();
        dir.y = -dir.y;
        const d11 = p11.getDotProduct(dir);
        const d21 = p21.getDotProduct(dir);
        const d12 = p12.getDotProduct(dir);
        const d22 = p22.getDotProduct(dir);
        const min = Math.min(d11, d21, d12, d22);
        const max = Math.max(d11, d21, d12, d22);
        const p1 = p11.getSumScaled(dir, min - d11);
        const p2 = p11.getSumScaled(dir, max - d11);
        return context.context.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
    }
}