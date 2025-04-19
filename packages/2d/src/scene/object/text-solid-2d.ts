import { Box2d, ReadonlyRectangle, Rectangle } from "@pluto/core";
import { Solid2d, Solid2dData } from "./solid-2d";
import { TextHAlign, TextVAlign } from "../../render/text-align";
import { RenderingContext2d } from "../../component/rendering-context-2d";
import { Material2d } from "../../material";

export interface TextSolid2dData extends Solid2dData {
    readonly text: string;
    readonly rectangle: ReadonlyRectangle;
    readonly fill?: boolean | undefined;
    readonly stroke?: boolean | undefined;
    readonly material?: Material2d | undefined;
    readonly hAlign?: TextHAlign | undefined;
    readonly vAlign?: TextVAlign | undefined;
}

export class TextSolid2d extends Solid2d {

    hAlign: TextHAlign;
    vAlign: TextVAlign;
    fill: boolean;
    stroke: boolean;

    private _text: string;
    private _material: Material2d;
    private _rectangle: Rectangle;

    get material(): Material2d {
        return this._material;
    }

    set material(m: Material2d) {
        if (this._material !== m) {
            // this._textMaterial.onChange.unsubscribe(this);
            this._material.releaseReference(this);
            this._material = m;
            // this._textMaterial.onChange.subscribe(this, () => this.setBoundingBoxModified());
            this._material.addReference(this);
            // TODO do we really need to update, if the font changes? Bounding box depends only on the rectangle.
            // this.setBoundingBoxModified();
        }
    }

    get rectangle(): ReadonlyRectangle {
        return this._rectangle;
    }

    set rectangle(r: ReadonlyRectangle) {
        if (!this._rectangle.equals(r)) {
            this._rectangle.setRectangle(r);
            this.setBoundingBoxModified();
        }
    }

    get text(): string {
        return this._text;
    }

    set text(t: string) {
        if (this._text !== t) {
            this._text = t;
            this.setBoundingBoxModified();
        }
    }

    constructor(data: Readonly<TextSolid2dData>) {
        super(data);
        this._text = data.text;
        this.fill = data.fill ?? false;
        this.stroke = data.stroke ?? false;
        this.hAlign = data.hAlign ?? TextHAlign.CENTER;
        this.vAlign = data.vAlign ?? TextVAlign.CENTER;
        this._rectangle = data.rectangle.clone();
        this._material = data.material ?? new Material2d();
        // TODO do we really need to update, if the font changes? Bounding box depends only on the rectangle.
        // this._textMaterial.onChange.subscribe(this, () => this.setBoundingBoxModified());
        this._material.addReference(this);
    }

    clone(): TextSolid2d {
        return new TextSolid2d({
            name: this.name,
            alpha: this.alpha,
            clipPath: this.clipPath,
            blendOperation: this.blendOperation,
            filter: this.filter,
            visible: this.visible,
            text: this._text,
            fill: this.fill,
            stroke: this.stroke,
            hAlign: this.hAlign,
            vAlign: this.vAlign,
            rectangle: this._rectangle,
            material: this._material,
        });
    }

    protected calculateBoundingBox(box: Box2d) {
        box.extend(this._rectangle.x1, this._rectangle.y1);
        box.extend(this._rectangle.x2, this._rectangle.y2);
    }

    protected onDelete() {
        // this._textMaterial.onChange.unsubscribe(this);
        this._material.releaseReference(this);
    }

    protected onRenderSafely() {
        this._material.use();
        const off = RenderingContext2d.current.getTextOffset(this._text, this._rectangle, this.hAlign, this.vAlign);
        if (this.fill) {
            RenderingContext2d.currentCanvasRenderingContext2d.fillText(this._text, off.x, off.y);
        }
        if (this.stroke) {
            RenderingContext2d.currentCanvasRenderingContext2d.strokeText(this._text, off.x, off.y);
        }
    }
}