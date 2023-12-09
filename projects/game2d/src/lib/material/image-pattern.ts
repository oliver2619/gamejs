import { RenderingContext2d } from "../render/rendering-context2d";
import { CoordSystem2, GarbageCollectibleObject, ImageResource, ReferencedObject } from "projects/core/src/public-api";

export type ImagePatternRepetition = 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';

export interface ImagePatternData {
    readonly repetition?: ImagePatternRepetition;
    readonly image: ImageResource;
}

export class ImagePattern implements ReferencedObject {

    readonly transform = new CoordSystem2({});

    repetition: ImagePatternRepetition;

    private readonly reference = new GarbageCollectibleObject(() => this.onDispose());

    private _image: ImageResource;
    private modified = true;
    private fillStyle: CanvasPattern | undefined;
    private matrix = new DOMMatrix([1, 0, 0, 1, 0, 0]);

    get alpha(): boolean {
        return this._image.alpha;
    }

    get hasReferences(): boolean {
        return this.reference.hasReferences;
    }

    get image(): ImageResource {
        return this._image;
    }

    set image(i: ImageResource) {
        if (this._image !== i) {
            this._image.releaseReference(this);
            this._image = i;
            this._image.addReference(this);
            this.modified = true;
        }
    }

    constructor(data: ImagePatternData) {
        this._image = data.image;
        this.repetition = data.repetition == undefined ? 'repeat' : data.repetition;
        this._image.addReference(this);
        this.transform.onModify.subscribe(() => this.onTransformChange());
    }

    addReference(holder: any) {
        this.reference.addReference(holder);
    }

    getFillOrStrokeStyle(context: CanvasRenderingContext2D): CanvasPattern {
        if (this.fillStyle == undefined || this.modified) {
            const pattern = context.createPattern(this._image.image, this.repetition);
            if (pattern == null) {
                throw new Error('Failed to create pattern');
            }
            this.fillStyle = pattern;
            this.fillStyle.setTransform(this.matrix);
            this.modified = false;
        }
        return this.fillStyle;
    }

    releaseReference(holder: any) {
        this.reference.releaseReference(holder);
    }

    useFill(context: RenderingContext2d) {
        context.context.fillStyle = this.getFillOrStrokeStyle(context.context);
    }

    private onDispose() {
        this._image.releaseReference(this);
    }

    private onTransformChange() {
        this.matrix.a = this.transform.xAxis.x;
        this.matrix.b = this.transform.yAxis.x;
        this.matrix.c = this.transform.xAxis.y;
        this.matrix.d = this.transform.yAxis.y;
        this.matrix.e = this.transform.position.x;
        this.matrix.f = -this.transform.position.y;
        if (this.fillStyle != undefined) {
            this.fillStyle.setTransform(this.matrix);
        }
    }
}