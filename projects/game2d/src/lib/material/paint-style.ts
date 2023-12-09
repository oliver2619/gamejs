import { GarbageCollectibleObject, ReferencedObject } from "projects/core/src/public-api";

export abstract class PaintStyle implements ReferencedObject {

    private readonly reference = new GarbageCollectibleObject(() => this.onDispose());

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