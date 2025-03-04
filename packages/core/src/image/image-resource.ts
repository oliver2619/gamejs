import { AbstractReferencedObject } from "../reference/abstract-referenced-object";
import { ImageObject } from "./image-object";

export class ImageResource extends AbstractReferencedObject {

    get height(): number {
        return this.image.height;
    }

    get isTransparent(): boolean {
        return this.image.alpha;
    }

    get width(): number {
        return this.image.width;
    }

    constructor(readonly image: ImageObject, readonly multiImageSize: number) {
        super();
    }

    protected onDelete(): void {
    }
}