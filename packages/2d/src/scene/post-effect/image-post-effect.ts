import { ImageResource } from "@pluto/core";
import { ImagePlacement } from "../../render/image-placement";
import { Blend2dOperation } from "../../render";
import { PostEffect } from "./post-effect";
import { RenderingContext2d } from "../../component/rendering-context-2d";

export interface ImagePostEffectData {
    image: ImageResource;
    placement?: ImagePlacement;
    blendOperation?: Blend2dOperation;
}

export class ImagePostEffect extends PostEffect {

    placement: ImagePlacement;
    blendOperation: Blend2dOperation;

    private _image: ImageResource;

    get image(): ImageResource {
        return this._image;
    }

    set image(i: ImageResource) {
        if (this._image !== i) {
            this._image.releaseReference(this);
            this._image = i;
            this._image.addReference(this);
        }
    }

    constructor(data: ImagePostEffectData) {
        super();
        this._image = data.image;
        this.placement = data.placement == undefined ? ImagePlacement.CENTER : data.placement;
        this.blendOperation = data.blendOperation ?? Blend2dOperation.NORMAL;
        this._image.addReference(this);
    }

    render() {
        RenderingContext2d.renderSafely(ctx => {
            ctx.canvasRenderingContext.globalCompositeOperation = this.blendOperation.value;
            ctx.drawFullscreenImage(this._image.image, this.placement);
        });
    }

    protected onDelete() {
        this._image.releaseReference(this);
    }
}