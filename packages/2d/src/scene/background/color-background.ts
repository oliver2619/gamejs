import {Background} from "./background";
import {Color} from 'core/src/index';
import {RenderingContext2d} from "../../rendering-context2d";

export class ColorBackground implements Background {

    readonly hasReferences = false

    constructor(public color: Color) {
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