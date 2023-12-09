import { Background } from "./background";
import { Color, ReadonlyColor } from 'projects/core/src/public-api';
import { RenderingContext2d } from "../../render/rendering-context2d";

export class ColorBackground implements Background {

    readonly hasReferences = false

    color: Color;

    constructor(color: ReadonlyColor) {
        this.color = color.clone();
    }

    addReference(holder: any): void {
    }

    releaseReference(holder: any): void {
    }

    render(context: RenderingContext2d): void {
        context.renderSafely(ctx => {
            if (this.color.a < 1) {
                ctx.clear();
            }
            ctx.context.fillStyle = `${this.color.toHtmlRgba()}`;
            ctx.fill();
        });
    }
}