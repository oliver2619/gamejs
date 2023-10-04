import { EventObservable } from "core/src/index";
import { Material, MaterialData } from "./material";

export interface TextMaterialData extends MaterialData {
    readonly fontSize?: number;
    readonly fontFamily?: string;
    readonly fontWeight?: string;
}

export class TextMaterial extends Material {

    readonly onChange = new EventObservable<TextMaterial>();

    private _font: string;
    private _fontSize: number = 10;
    private _fontFamily: string = 'sans-serif';
    private _fontWeight: string = '';

    get font(): string {
        return this._font;
    }

    get fontFamily(): string {
        return this._fontFamily;
    }

    set fontFamily(f: string) {
        if (this._fontFamily !== f) {
            this._fontFamily = f;
            this.buildFont();
            this.onChange.produce(this);
        }
    }

    get fontSize(): number {
        return this._fontSize;
    }

    set fontSize(s: number) {
        if (this._fontSize !== s && s > 0) {
            this._fontSize = s;
            this.buildFont();
            this.onChange.produce(this);
        }
    }

    get fontWeight(): string {
        return this._fontWeight;
    }

    set fontWeight(w: string) {
        if (this._fontWeight !== w) {
            this._fontWeight = w;
            this.buildFont();
            this.onChange.produce(this);
        }
    }

    constructor(data?: TextMaterialData) {
        super(data);
        this._fontFamily = data == undefined || data.fontFamily == undefined ? 'sans-serif' : data.fontFamily;
        this._fontSize = data == undefined || data.fontSize == undefined ? 10 : data.fontSize;
        this._fontWeight = data == undefined || data.fontWeight == undefined ? 'normal' : data.fontWeight;
        this._font = this.buildFont();
    }

    clone(): TextMaterial {
        return new TextMaterial({
            alpha: this.alpha,
            fill: this.fill,
            fontFamily: this._fontFamily,
            fontSize: this._fontSize,
            fontWeight: this._fontWeight,
            stroke: this.stroke
        });
    }

    cloneDeep(): TextMaterial {
        return new TextMaterial({
            alpha: this.alpha,
            fill: this.fill?.clone(),
            fontFamily: this._fontFamily,
            fontSize: this._fontSize,
            fontWeight: this._fontWeight,
            stroke: this.stroke?.clone()
        });
    }

    useFont(context: CanvasRenderingContext2D) {
        context.font = this._font;
    }

    private buildFont(): string {
        return `${this._fontWeight} ${this._fontSize}px ${this._fontFamily}`;
    }
}