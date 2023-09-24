import { ReferencedObject } from 'core/src/reference/referenced-object';
import { GarbageCollectibleObject } from 'core/src/reference/garbace-collectible-object';
import { Scene2DLayer } from './scene2d-layer';

export class Scene2D implements ReferencedObject {

    private readonly reference = new GarbageCollectibleObject(() => { });
    private readonly layers: Scene2DLayer[] = [];

    get hasReferences(): boolean {
        return this.reference.hasReferences;
    }

    addReference(holder: any) {
        this.reference.addReference(holder);
    }

    releaseReference(holder: any) {
        this.reference.releaseReference(holder);
    }

    render(context: CanvasRenderingContext2D) {
        
    }
}