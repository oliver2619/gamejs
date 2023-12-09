import { RenderingContext2d } from "../../render/rendering-context2d";
import { Box2, ImageResource, ReadonlyVector2, Vector2 } from "projects/core/src/public-api";
import { Solid2, Solid2Data } from "./solid2";

export interface ImageSolid2Data extends Solid2Data {

    readonly image: ImageResource;
    readonly alpha?: number;
    readonly position?: ReadonlyVector2;
    readonly scale?: number;
    readonly index?: number;
}

export class ImageSolid2 extends Solid2 {

    readonly position: Vector2;

    index: number;
    alpha: number;

    private _image: ImageResource;
    private _scale: number;

    get image(): ImageResource {
        return this._image;
    }

    set image(i: ImageResource) {
        if (this._image !== i) {
            const boxModified = this._image.width !== i.width || this._image.height !== i.height;
            this._image.releaseReference(this);
            this._image = i;
            this._image.addReference(this);
            if (boxModified) {
                this.updateBoundingBox();
            }
        }
    }

    get scale(): number {
        return this._scale;
    }

    set scale(s: number) {
        if (this._scale !== s) {
            this._scale = s;
            this.updateBoundingBox();
        }
    }

    constructor(data: ImageSolid2Data) {
        super(data);
        this._image = data.image;
        this.alpha = data.alpha == undefined ? 1 : data.alpha;
        this.position = data.position == undefined ? new Vector2(0, 0) : data.position.clone();
        this._scale = data.scale == undefined ? 1 : data.scale;
        this.index = data.index == undefined ? 0 : data.index;
        this._image.addReference(this);
        this.updateBoundingBox();
        this.position.onModify.subscribe(() => {
            this.updateBoundingBox();
        });
    }

    protected calculateBoundingBox(box: Box2) {
        box.extendByPoint(this.position);
        box.extendByDirection(new Vector2(this._image.width * this._scale, this._image.height * this._scale));
    }

    protected onDispose() {
        this._image.releaseReference(this);
    }

    protected onRenderSafely(context: RenderingContext2d) {
        context.context.globalAlpha *= this.alpha;
        this._image.renderMultiImage(this.position.x, this.position.y, this.index, this._scale, context.context);
    }
}