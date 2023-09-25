import {PostEffect} from "./post-effect";
import {CompositeOperation} from "../composite-operation";
import {Color} from "core/src/index";
import {RenderingContext2d} from "../../rendering-context2d";

export class PostEffectColor implements PostEffect {

    readonly hasReferences = false

    constructor(public compositeOperation: CompositeOperation, public color: Color) {
    }

    addReference(holder: any): void {
    }

    releaseReference(holder: any): void {
    }

    render(context: RenderingContext2d) {
        context.renderSafely(ctx => {
            ctx.context.globalCompositeOperation = this.compositeOperation.value;
            ctx.context.fillStyle = this.color.toHtmlRgba();
            ctx.context.fillRect(0, 0, ctx.viewportSize.x, ctx.viewportSize.y);
        });
    }
}