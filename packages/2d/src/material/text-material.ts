import { EventObservable, Observable, ReadonlyVector2d } from "@pluto/core";
import { RenderingContext2d } from "../component/rendering-context-2d";
import { Material2d, Material2dData } from "./material-2d";

export interface TextMaterialData extends Material2dData {
    readonly fontSize?: number;
    readonly fontFamily?: string;
    readonly fontWeight?: string;
}

export class TextMaterial extends Material2d {

    private readonly _onChange = new EventObservable<TextMaterial>();
    private _font: string;
    private _fontSize: number;
    private _fontFamily: string;
    private _fontWeight: string;

    get font(): string {
        return this._font;
    }

    get fontFamily(): string {
        return this._fontFamily;
    }

    set fontFamily(f: string) {
        if (this._fontFamily !== f) {
            this._fontFamily = f;
            this._font = this.buildFont();
            this._onChange.next(this);
        }
    }

    get fontSize(): number {
        return this._fontSize;
    }

    set fontSize(s: number) {
        if (this._fontSize !== s && s > 0) {
            this._fontSize = s;
            this._font = this.buildFont();
            this._onChange.next(this);
        }
    }

    get fontWeight(): string {
        return this._fontWeight;
    }

    set fontWeight(w: string) {
        if (this._fontWeight !== w) {
            this._fontWeight = w;
            this._font = this.buildFont();
            this._onChange.next(this);
        }
    }

    get onChange(): Observable<TextMaterial> {
        return this._onChange;
    }

    constructor(data?: TextMaterialData) {
        super(data);
        this._fontFamily = data?.fontFamily ?? 'sans-serif';
        this._fontSize = data?.fontSize ?? 10;
        this._fontWeight = data?.fontWeight ?? 'normal';
        this._font = this.buildFont();
    }

    override clone(): TextMaterial {
        return new TextMaterial({
            alpha: this.alpha,
            fill: this.fill,
            fontFamily: this._fontFamily,
            fontSize: this._fontSize,
            fontWeight: this._fontWeight,
            stroke: this.stroke,
            line: this.line?.clone()
        });
    }

    override cloneAt(origin: ReadonlyVector2d): TextMaterial {
        return new TextMaterial({
            alpha: this.alpha,
            fill: this.fill?.cloneAt(origin),
            fontFamily: this._fontFamily,
            fontSize: this._fontSize,
            fontWeight: this._fontWeight,
            stroke: this.stroke?.cloneAt(origin),
            line: this.line?.clone()
        });
    }

    override cloneDeep(): TextMaterial {
        return new TextMaterial({
            alpha: this.alpha,
            fill: this.fill?.clone(),
            fontFamily: this._fontFamily,
            fontSize: this._fontSize,
            fontWeight: this._fontWeight,
            stroke: this.stroke?.clone(),
            line: this.line?.clone()
        });
    }

    override use(): void {
        super.use();
        RenderingContext2d.currentCanvasRenderingContext2d.font = this._font;
    }

    private buildFont(): string {
        return `${this._fontWeight} ${this._fontSize}px ${this._fontFamily}`;
    }
}