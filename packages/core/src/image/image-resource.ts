import { ReferencedObject } from "../reference/referenced-object";
import { ReferencedObjects } from "../reference/referenced-objects";
import { ImageObject } from "./image-object";

export class ImageResource implements ReferencedObject {

    private readonly referencedObject: ReferencedObject;

    get height(): number {
        return this.image.height;
    }

    get isTransparent(): boolean {
        return this.image.alpha;
    }

    get width(): number {
        return this.image.width;
    }

    constructor(readonly image: ImageObject, readonly multiImageSize: number, onDelete: () => void) {
        this.referencedObject = ReferencedObjects.create(onDelete);
    }

    addReference(owner: any): void {
        this.referencedObject.addReference(owner);
    }

    releaseReference(owner: any): void {
        this.referencedObject.releaseReference(owner);
    }
}