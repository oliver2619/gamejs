import { RenderingContext2d } from "../../render/rendering-context2d";
import { Box2, ReadonlyRectangle, Rectangle } from "projects/core/src/public-api";
import { Solid2, Solid2Data } from "./solid2";
import { TextMaterial } from "../../material/text-material";
import { TextHAlign, TextVAlign } from "../../render/text-align";

export interface TextSolid2Data extends Solid2Data {

    readonly text: string;
    readonly rectangle: ReadonlyRectangle;
    readonly material?: TextMaterial;
    readonly hAlign?: TextHAlign;
    readonly vAlign?: TextVAlign;
}

export class TextSolid2 extends Solid2 {

    readonly rectangle: Rectangle;

    hAlign: TextHAlign;
    vAlign: TextVAlign;

    private _text: string;
    private _textMaterial: TextMaterial;

    get material(): TextMaterial {
        return this._textMaterial;
    }

    set material(m: TextMaterial) {
        if (this._textMaterial !== m) {
            this._textMaterial.onChange.unsubscribeAllForReceiver(this);
            this._textMaterial.releaseReference(this);
            this._textMaterial = m;
            this._textMaterial.onChange.subscribeFor(this, () => this.updateBoundingBox());
            this._textMaterial.addReference(this);
            this.updateBoundingBox();
        }
    }

    get text(): string {
        return this._text;
    }

    set text(t: string) {
        if (this._text !== t) {
            this._text = t;
            this.updateBoundingBox();
        }
    }

    constructor(data: TextSolid2Data) {
        super(data);
        this._text = data.text;
        this.hAlign = data.hAlign == undefined ? TextHAlign.CENTER : data.hAlign;
        this.vAlign = data.vAlign == undefined ? TextVAlign.CENTER : data.vAlign;
        this.rectangle = data.rectangle.clone();
        this._textMaterial = data.material == undefined ? new TextMaterial() : data.material;
        this._textMaterial.onChange.subscribeFor(this, () => this.updateBoundingBox());
        this._textMaterial.addReference(this);
        this.rectangle.onModify.subscribe(() => this.updateBoundingBox());
    }

    protected calculateBoundingBox(box: Box2) {
        box.extend(this.rectangle.x1, this.rectangle.y1);
        box.extend(this.rectangle.x2, this.rectangle.y2);
    }

    protected onDispose() {
        this._textMaterial.onChange.unsubscribeAllForReceiver(this);
        this._textMaterial.releaseReference(this);
    }

    protected onRenderSafely(context: RenderingContext2d) {
        this._textMaterial.useFont(context.context);
        const off = context.getTextOffset(this._text, this.rectangle, this.hAlign, this.vAlign);
        this._textMaterial.use(context.context,
            () => context.context.fillText(this._text, off.x, off.y),
            () => context.context.strokeText(this._text, off.x, off.y));
    }
}