import { EventObservable, GarbageCollectibleObject, ReferencedObject } from "core";

export abstract class PaintStyle implements ReferencedObject {

    readonly onReleaseLastReference = new EventObservable<void>();

    private readonly reference = new GarbageCollectibleObject(() => {
        this.onDispose();
        this.onReleaseLastReference.produce();
    });

    get hasReferences(): boolean {
        return this.reference.hasReferences;
    }

    addReference(holder: any) {
        this.reference.addReference(holder);
    }

    abstract clone(): PaintStyle;

    releaseReference(holder: any) {
        this.reference.releaseReference(holder);
    }

    abstract getStyle(context: CanvasRenderingContext2D): string | CanvasGradient | CanvasPattern;

    protected abstract onDispose(): void;
}