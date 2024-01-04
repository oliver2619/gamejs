import { Color, ReadonlyColor } from "core";
import { PaintStyle } from "./paint-style";

export interface ColorStyleData {

    readonly color: ReadonlyColor;
}

export class ColorStyle extends PaintStyle {

    readonly color: Color;

    private style: string;

    constructor(data: ColorStyleData) {
        super();
        this.color = data.color.clone();
        this.style = this.color.toHtmlRgba();
        this.color.onChange.subscribe(() => this.style = this.color.toHtmlRgba());
    }

    clone(): ColorStyle {
        return new ColorStyle({ color: this.color });
    }

    getStyle(_: CanvasRenderingContext2D): string | CanvasGradient | CanvasPattern {
        return this.style;
    }

    protected onDispose(): void {
    }
}