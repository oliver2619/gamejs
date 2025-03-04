import { ImageResource } from "@pluto/core";
import { Background } from "./background";
import { ImagePlacement } from "../../render/image-placement";
import { RenderingContext2d } from "../../component/rendering-context-2d";
import { Filter, FilterStack } from "../../render/filter";

export interface ImageBackgroundData {
    readonly alpha?: number;
    readonly filter?: Filter;
    readonly image: ImageResource;
    readonly placement?: ImagePlacement;
}

export class ImageBackground extends Background {

    alpha: number;
    filter: Filter;
    placement: ImagePlacement;

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

    constructor(data: ImageBackgroundData) {
        super();
        this.alpha = data.alpha == undefined ? 1 : data.alpha;
        this.filter = data.filter == undefined ? FilterStack.createDefaultFilter() : { ...data.filter };
        this._image = data.image;
        this.placement = data.placement ?? ImagePlacement.CENTER;
        this._image.addReference(this);
    }

    render(): void {
        RenderingContext2d.withFilter(this.filter, (ctx) => {
            if (this._image.isTransparent || this.alpha < 1 || (this.placement !== ImagePlacement.STRETCHED && this.placement !== ImagePlacement.SMOOTH_STRETCHED)) {
                ctx.clear()
            }
            ctx.canvasRenderingContext.globalAlpha *= this.alpha;
            ctx.drawFullscreenImage(this._image.image, this.placement);
        });
    }

    protected onDelete() {
        this._image.releaseReference(this);
    }
}