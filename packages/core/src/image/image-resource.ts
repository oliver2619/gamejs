import { GarbageCollectibleObject } from "../reference/garbace-collectible-object";
import { ReferencedObject } from "../reference/referenced-object";

export class ImageResource implements ReferencedObject {

    private readonly reference: ReferencedObject;

    get hasReferences(): boolean {
        return this.reference.hasReferences;
    }

    constructor(public readonly image: HTMLImageElement, onDispose: () => void) {
        this.reference = new GarbageCollectibleObject(onDispose);
    }

    addReference(holder: any) {
        this.reference.addReference(holder);
    }

    releaseReference(holder: any) {
        this.reference.releaseReference(holder);
    }
}