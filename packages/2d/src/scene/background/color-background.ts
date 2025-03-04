import { Color, ReadonlyColor } from "@pluto/core";
import { Background } from "./background";
import { RenderingContext2d } from "../../component/rendering-context-2d";

export class ColorBackground extends Background {

    private _color: Color;
    private modified = true;
    private style: string = '';

    get color(): ReadonlyColor {
        return this._color;
    }

    set color(c: ReadonlyColor) {
        this._color.setColor(c);
        this.modified = true;
    }

    constructor(color: ReadonlyColor) {
        super();
        this._color = color.clone();
    }

    render(): void {
        if (this.modified) {
            this.style = `${this.color.toHtmlRgba()}`;
            this.modified = false;
        }
        RenderingContext2d.renderSafely(ctx => {
            if (this._color.a < 1) {
                ctx.clear();
            }
            if (this._color.a > 0) {
                ctx.canvasRenderingContext.fillStyle = this.style;
                ctx.fill();
            }
        });
    }

    protected onDelete(): void {
    }
}