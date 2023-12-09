import { RenderingContext2d } from "../../render/rendering-context2d";
import { GarbageCollectibleObject, ImageResource } from "projects/core/src/public-api";
import { Filter } from "../../render/filter";
import { Background } from "./background";
import { ImagePlacement } from "../../render/image-placement";

export interface ImageBackgroundData {
    readonly alpha?: number;
    readonly image: ImageResource;
    readonly placement?: ImagePlacement;
}

export class ImageBackground implements Background {

    alpha = 1;
    filter = new Filter();
    placement: ImagePlacement;

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

    constructor(data: ImageBackgroundData) {
        this.alpha = data.alpha == undefined ? 1 : data.alpha;
        this._image = data.image;
        this.placement = data.placement == undefined ? ImagePlacement.CENTER : data.placement;
        this._image.addReference(this);
    }

    addReference(holder: any) {
        this.reference.addReference(holder);
    }

    releaseReference(holder: any) {
        this.reference.releaseReference(holder);
    }

    render(context: RenderingContext2d) {
        context.withFilter(this.filter, ctx => {
            if (this._image.alpha || this.alpha < 1 || (this.placement !== ImagePlacement.STRETCHED && this.placement !== ImagePlacement.SMOOTH_STRETCHED)) {
                ctx.clear()
            }
            ctx.context.globalAlpha *= this.alpha;
            this.filter.use(ctx.context);
            ctx.drawFullscreenImage(this._image.image, this.placement);
        });
    }

    private onDispose() {
        this._image.releaseReference(this);
    }
}