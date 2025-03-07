import { Box2d, ImageResource, ReadonlyVector2d, Vector2d } from "@pluto/core";
import { Solid2d, Solid2dData } from "./solid-2d";
import { RenderingContext2d } from "../../component/rendering-context-2d";

export interface ImageSolid2dData extends Solid2dData {
    image: ImageResource;
    position?: ReadonlyVector2d | undefined;
    scale?: number | undefined;
    index?: number | undefined;
}

export class ImageSolid2d extends Solid2d {

    index: number;

    private _image: ImageResource;
    private _scale: number;
    private _position: Vector2d;

    get image(): ImageResource {
        return this._image;
    }

    set image(i: ImageResource) {
        if (this._image !== i) {
            const boxModified = this._image.width !== i.image.width || this._image.height !== i.height;
            this._image.releaseReference(this);
            this._image = i;
            this._image.addReference(this);
            if (boxModified) {
                this.setBoundingBoxModified();
            }
        }
    }

    get position(): ReadonlyVector2d {
        return this._position;
    }

    set position(p: ReadonlyVector2d) {
        if (!this._position.equals(p)) {
            this._position.setVector(p);
            this.setBoundingBoxModified();
        }
    }

    get scale(): number {
        return this._scale;
    }

    set scale(s: number) {
        if (this._scale !== s) {
            this._scale = s;
            this.setBoundingBoxModified();
        }
    }

    constructor(data: Readonly<ImageSolid2dData>) {
        super(data);
        this._image = data.image;
        this._position = data.position?.clone() ?? new Vector2d(0, 0);
        this._scale = data.scale ?? 1;
        this.index = data.index ?? 0;
        this._image.addReference(this);
    }

    clone(): ImageSolid2d {
        return new ImageSolid2d({
            name: this.name,
            image: this._image,
            alpha: this.alpha,
            blendOperation: this.blendOperation,
            clipPath: this.clipPath,
            filter: this.filter,
            index: this.index,
            position: this._position,
            scale: this._scale,
            visible: this.visible
        });
    }

    protected calculateBoundingBox(box: Box2d) {
        box.extendByPoint(this._position);
        box.extendByDirection(new Vector2d(this._image.width * this._scale, this._image.height * this._scale));
    }

    protected onDelete() {
        this._image.releaseReference(this);
    }

    protected onRenderSafely() {
        this._image.image.renderMultiImage(this._position.x, this._position.y, this.index, this._image.multiImageSize, this._scale, RenderingContext2d.currentCanvasRenderingContext2d);
    }
}