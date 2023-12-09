import { ReferencedObject, GarbageCollectibleObject } from 'projects/core/src/public-api';
import { LineStyle } from './line-style';
import { PaintStyle } from './paint-style';

export interface MaterialData {
    readonly alpha?: number;
    readonly fill?: PaintStyle;
    readonly stroke?: PaintStyle;
    readonly line?: LineStyle;
}

export class Material implements ReferencedObject {

    alpha: number;

    private readonly reference = new GarbageCollectibleObject(() => this.onDispose());

    private _fill: PaintStyle | undefined;
    private _stroke: PaintStyle | undefined;
    private _line: LineStyle;

    get fill(): PaintStyle | undefined {
        return this._fill;
    }

    set fill(m: PaintStyle | undefined) {
        if (this._fill !== m) {
            this._fill?.releaseReference(this);
            this._fill = m;
            this._fill?.addReference(this);
        }
    }

    get hasReferences(): boolean {
        return this.reference.hasReferences;
    }

    get line(): LineStyle {
        return this._line;
    }

    set line(l: LineStyle) {
        this._line = l;
    }

    get stroke(): PaintStyle | undefined {
        return this._stroke;
    }

    set stroke(m: PaintStyle | undefined) {
        if (this._stroke !== m) {
            this._stroke?.releaseReference(this);
            this._stroke = m;
            this._stroke?.addReference(this);
        }
    }

    constructor(data?: MaterialData) {
        this.alpha = data == undefined || data.alpha == undefined ? 1 : data.alpha;
        this._fill = data == undefined ? undefined : data.fill;
        this._stroke = data == undefined ? undefined : data.stroke;
        this._line = data?.line == undefined ? new LineStyle() : data.line;
        this._fill?.addReference(this);
        this._stroke?.addReference(this);
    }

    addReference(holder: any) {
        this.reference.addReference(holder);
    }

    clone(): Material {
        return new Material({ alpha: this.alpha, fill: this._fill, stroke: this._stroke, line: this._line });
    }

    cloneDeep(): Material {
        return new Material({ alpha: this.alpha, fill: this._fill?.clone(), stroke: this._stroke?.clone(), line: this._line.clone() });
    }

    releaseReference(holder: any) {
        this.reference.releaseReference(holder);
    }

    use(context: CanvasRenderingContext2D, fill: () => void, stroke: () => void) {
        context.globalAlpha *= this.alpha;
        if (this._fill != undefined) {
            context.fillStyle = this._fill.getStyle(context);
            fill();
        }
        if (this._stroke != undefined) {
            this._line.use(context);
            context.strokeStyle = this._stroke.getStyle(context);
            stroke();
        }
    }

    private onDispose() {
        this._fill?.releaseReference(this);
        this._stroke?.releaseReference(this);
    }
}