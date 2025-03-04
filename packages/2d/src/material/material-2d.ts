import { AbstractReferencedObject, ReadonlyVector2d} from "@pluto/core";
import { PaintStyle } from "./paint-style";
import { LineStyle } from "./line-style";
import { RenderingContext2d } from "../component/rendering-context-2d";

export interface Material2dData {
    readonly alpha?: number | undefined;
    readonly fill?: PaintStyle | undefined;
    readonly stroke?: PaintStyle | undefined;
    readonly line?: LineStyle | undefined;
}

export class Material2d extends AbstractReferencedObject {

    alpha: number;

    private _fill: PaintStyle | undefined;
    private _stroke: PaintStyle | undefined;
    private _line: LineStyle | undefined;

    get fill(): PaintStyle | undefined {
        return this._fill;
    }

    set fill(f: PaintStyle | undefined) {
        if (this._fill !== f) {
            this._fill?.releaseReference(this);
            this._fill = f;
            this._fill?.addReference(this);
        }
    }

    get line(): LineStyle | undefined {
        return this._line;
    }

    set line(l: LineStyle | undefined) {
        this._line = l;
    }

    get stroke(): PaintStyle | undefined {
        return this._stroke;
    }

    set stroke(s: PaintStyle | undefined) {
        if (this._stroke !== s) {
            this._stroke?.releaseReference(this);
            this._stroke = s;
            this._stroke?.addReference(this);
        }
    }

    constructor(data?: Material2dData) {
        super();
        this.alpha = data?.alpha ?? 1;
        this._fill = data?.fill;
        this._stroke = data?.stroke;
        this._line = data?.line;
        this._fill?.addReference(this);
        this._stroke?.addReference(this);
    }

    clone(): Material2d {
        return new Material2d({ alpha: this.alpha, fill: this._fill, stroke: this._stroke, line: this._line });
    }

    cloneAt(origin: ReadonlyVector2d): Material2d {
        return new Material2d({ alpha: this.alpha, fill: this._fill?.cloneAt(origin), stroke: this._stroke?.cloneAt(origin), line: this._line?.clone() });
    }

    cloneDeep(): Material2d {
        return new Material2d({ alpha: this.alpha, fill: this._fill?.clone(), stroke: this._stroke?.clone(), line: this._line?.clone() });
    }

    use() {
        const context = RenderingContext2d.currentCanvasRenderingContext2d;
        context.globalAlpha *= this.alpha;
        if (this._fill != undefined) {
            context.fillStyle = this._fill.getStyle();
        }
        if (this._stroke != undefined) {
            context.strokeStyle = this._stroke.getStyle();
        }
        if (this._line != undefined) {
            this._line.use();
        }
    }

    protected onDelete() {
        this._fill?.releaseReference(this);
        this._stroke?.releaseReference(this);
    }
}