import { GarbageCollectibleObject } from "../reference/garbace-collectible-object";
import { ReferencedObject } from "../reference/referenced-object";

export class ImageResource implements ReferencedObject {

    readonly height: number;
    readonly width: number;

    private readonly reference: ReferencedObject;

    get hasReferences(): boolean {
        return this.reference.hasReferences;
    }

    constructor(public readonly image: HTMLImageElement | HTMLCanvasElement, public readonly alpha: boolean, private multiImageSize: number, onDispose: () => void) {
        this.reference = new GarbageCollectibleObject(onDispose);
        this.width = image.width;
        this.height = (image.height / this.multiImageSize) | 0;
    }

    addReference(holder: any) {
        this.reference.addReference(holder);
    }

    releaseReference(holder: any) {
        this.reference.releaseReference(holder);
    }

    render(x: number, y: number, context: CanvasRenderingContext2D) {
        context.drawImage(this.image, x, 1 - this.image.height - y);
    }

    renderScaled(x: number, y: number, scale: number, context: CanvasRenderingContext2D) {
        context.drawImage(this.image, x, (1 - this.image.height) * scale - y, this.width * scale, this.image.height * scale);
    }

    renderMultiImage(x: number, y: number, imageNo: number, scale: number, context: CanvasRenderingContext2D) {
        let i: number;
        if (imageNo < 0) {
            i = this.multiImageSize - ((Math.round(-imageNo) - 1) % this.multiImageSize) - 1;
        } else {
            i = Math.round(imageNo) % this.multiImageSize;
        }
        context.drawImage(this.image, 0, i * this.height, this.width, this.height, x, -this.height * scale - y, this.width * scale, this.height * scale);
    }
}