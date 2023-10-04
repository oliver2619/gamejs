import { PostEffect } from "./post-effect";
import { CompositeOperation } from "../../render/composite-operation";
import { Color, ReadonlyColor } from "core/src/index";
import { RenderingContext2d } from "../../render/rendering-context2d";

export interface ColorPostEffectData {
    readonly compositeOperation: CompositeOperation;
    readonly color: ReadonlyColor;
}

export class ColorPostEffect implements PostEffect {

    readonly hasReferences = false;

    compositeOperation: CompositeOperation;
    color: Color;

    constructor(data: ColorPostEffectData) {
        this.color = data.color.clone();
        this.compositeOperation = data.compositeOperation;
    }

    addReference(holder: any): void {
    }

    releaseReference(holder: any): void {
    }

    render(context: RenderingContext2d) {
        context.renderSafely(ctx => {
            ctx.context.globalCompositeOperation = this.compositeOperation.value;
            ctx.context.fillStyle = this.color.toHtmlRgba();
            ctx.fill();
        });
    }
}