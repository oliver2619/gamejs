import { Color, ReadonlyColor, ReadonlyVector2d } from "@pluto/core";
import { PaintStyle } from "./paint-style";

export class ColorStyle extends PaintStyle {

    private _color: Color;
    private style: string;

    get color(): ReadonlyColor {
        return this._color;
    }

    set color(c: ReadonlyColor) {
        this._color = c.clone();
        this.style = this._color.toHtmlRgba();
    }

    constructor(color: Color) {
        super();
        this._color = color.clone();
        this.style = this._color.toHtmlRgba();
    }

    clone(): PaintStyle {
        return new ColorStyle(this._color);
    }

    cloneAt(_: ReadonlyVector2d): PaintStyle {
        return new ColorStyle(this._color);
    }

    getStyle(): string | CanvasGradient | CanvasPattern {
        return this.style;
    }

    protected onDelete(): void {
    }
}