import { CoordSystem2d, ImageResource, ReadonlyCoordSystem2d, ReadonlyVector2d } from "@pluto/core";
import { PaintStyle } from "./paint-style";
import { RenderingContext2d } from "../component/rendering-context-2d";

export type PatternRepetition = 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';

export interface PatternStyleData {
    image: ImageResource;
    offset?: ReadonlyVector2d | undefined;
    repetition?: PatternRepetition | undefined;
    rotate?: number | undefined;
    scale?: number | undefined;
    transform?: ReadonlyCoordSystem2d | undefined;
}

export class PatternStyle extends PaintStyle {

    private _transform: CoordSystem2d;
    private _repetition: PatternRepetition;
    private _imageResource: ImageResource;
    private modified = true;
    private fillStyle: CanvasPattern | undefined;
    private readonly matrix = new DOMMatrix([1, 0, 0, 1, 0, 0]);

    get isTransparent(): boolean {
        return this._imageResource.isTransparent;
    }

    get image(): ImageResource {
        return this._imageResource;
    }

    set image(i: ImageResource) {
        if (this._imageResource !== i) {
            this._imageResource.releaseReference(this);
            this._imageResource = i;
            this._imageResource.addReference(this);
            this.modified = true;
        }
    }

    get repetition(): PatternRepetition {
        return this._repetition;
    }

    set repetition(r: PatternRepetition) {
        if (this._repetition !== r) {
            this._repetition = r;
            this.modified = true;
        }
    }

    get transform(): ReadonlyCoordSystem2d {
        return this._transform;
    }

    constructor(data: Readonly<PatternStyleData>) {
        super();
        this._imageResource = data.image;
        this._repetition = data.repetition ?? 'repeat';
        this._imageResource.addReference(this);
        this._transform = data.transform?.clone() ?? new CoordSystem2d({});
        if (data.offset != undefined) {
            this._transform.position.add(data.offset);
        }
        if (data.scale != undefined) {
            this._transform.scale(data.scale);
        }
        if (data.rotate != undefined) {
            this._transform.rotate(data.rotate);
        }
    }

    clone(): PaintStyle {
        return new PatternStyle({ image: this._imageResource, repetition: this._repetition, transform: this._transform.clone() });
    }

    cloneAt(origin: ReadonlyVector2d): PaintStyle {
        const transform = this._transform.clone();
        transform.position.add(origin);
        return new PatternStyle({ image: this._imageResource, repetition: this._repetition, transform });
    }

    getStyle(): string | CanvasGradient | CanvasPattern {
        if (this.fillStyle == undefined || this.modified) {
            this.updateMatrix();
            const pattern = RenderingContext2d.currentCanvasRenderingContext2d.createPattern(this._imageResource.image.canvasImageSource, this._repetition);
            if (pattern == null) {
                throw new Error('Failed to create pattern.');
            }
            this.fillStyle = pattern;
            this.fillStyle.setTransform(this.matrix);
            this.modified = false;
        }
        return this.fillStyle;
    }

    modifyTransform(callback: (cs: CoordSystem2d) => CoordSystem2d) {
        this._transform = callback(this._transform);
        this.updateMatrix();
        if (this.fillStyle != undefined) {
            this.fillStyle.setTransform(this.matrix);
        }
    }

    protected onDelete(): void {
        this._imageResource.releaseReference(this);
    }

    private updateMatrix() {
        this.matrix.a = this._transform.xAxis.x;
        this.matrix.b = -this._transform.xAxis.y;
        this.matrix.c = -this._transform.yAxis.x;
        this.matrix.d = this._transform.yAxis.y;
        this.matrix.e = this._transform.position.x;
        this.matrix.f = -this._transform.position.y;
    }
}