import { ReferencedObject, ReferencedObjects } from "../referenced-object";

export class ImageResource implements ReferencedObject {

    private readonly referencedObject: ReferencedObject;

    constructor(readonly image: HTMLImageElement, onDelete: () => void) {
        this.referencedObject = ReferencedObjects.create(onDelete);
    }

    addReference(owner: any): void {
        this.referencedObject.addReference(owner);
    }

    releaseReference(owner: any): void {
        this.referencedObject.releaseReference(owner);
    }
}