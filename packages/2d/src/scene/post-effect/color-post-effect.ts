import { Color, ReadonlyColor } from "@pluto/core";
import { PostEffect } from "./post-effect";
import { Blend2dOperation } from "../../render";
import { RenderingContext2d } from "../../component/rendering-context-2d";

export interface ColorPostEffectData {
    blendOperation?: Blend2dOperation;
    color: ReadonlyColor;
}

export class ColorPostEffect extends PostEffect {

    blendOperation: Blend2dOperation;
    private _color: Color;
    private style = '';
    private modified = true;

    get color(): ReadonlyColor {
        return this._color;
    }

    set color(c: ReadonlyColor) {
        if (!this._color.equals(c)) {
            this._color.setColor(c);
            this.modified = true;
        }
    }

    constructor(data: Readonly<ColorPostEffectData>) {
        super();
        this._color = data.color.clone();
        this.blendOperation = data.blendOperation ?? 'multiply';
    }

    render(): void {
        if (this.modified) {
            this.style = this._color.toHtmlRgba();
            this.modified = false;
        }
        RenderingContext2d.renderSafely(ctx => {
            ctx.canvasRenderingContext.globalCompositeOperation = this.blendOperation;
            ctx.canvasRenderingContext.fillStyle = this.style;
            ctx.fill();
        });
    }

    protected onDelete(): void {
    }
}