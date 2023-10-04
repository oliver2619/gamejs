import { RenderingContext2d } from "../../render/rendering-context2d";
import { GarbageCollectibleObject, ImageResource } from "core/src/index";
import { ImagePlacement } from "../../render/image-placement";
import { PostEffect } from "./post-effect";
import { CompositeOperation } from "../../render/composite-operation";

export interface ImagePostEffectData {
    readonly image: ImageResource;
    readonly placement?: ImagePlacement;
    readonly compositeOperation?: CompositeOperation;
}

export class ImagePostEffect implements PostEffect {

    placement: ImagePlacement;
    compositeOperation: CompositeOperation;

    private readonly reference = new GarbageCollectibleObject(() => this.onDispose());

    private _image: ImageResource;

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
        }
    }

    constructor(data: ImagePostEffectData) {
        this._image = data.image;
        this.placement = data.placement == undefined ? ImagePlacement.CENTER : data.placement;
        this.compositeOperation = data.compositeOperation == undefined ? CompositeOperation.NORMAL : data.compositeOperation;
        this._image.addReference(this);
    }

    addReference(holder: any) {
        this.reference.addReference(holder);
    }

    releaseReference(holder: any) {
        this.reference.releaseReference(holder);
    }

    render(context: RenderingContext2d) {
        context.renderSafely(ctx => {
            ctx.context.globalCompositeOperation = this.compositeOperation.value;
            ctx.drawFullscreenImage(this._image.image, this.placement);
        });
    }

    private onDispose() {
        this._image.releaseReference(this);
    }
}