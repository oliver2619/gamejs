import {ReferencedObject, GarbageCollectibleObject} from 'core/src/index';

export class Material implements ReferencedObject{

    alpha = 1;

    private readonly reference = new GarbageCollectibleObject(() => this.onDispose());

    // private fillMaterial: FillMaterial;
    // private strokeMaterial: StrokeMaterial;

    get hasReferences(): boolean {
        return this.reference.hasReferences;
    }

    addReference(holder: any) {
        this.reference.addReference(holder);
    }

    releaseReference(holder: any) {
        this.reference.releaseReference(holder);
    }

    use(context: CanvasRenderingContext2D) {
        context.globalAlpha *= this.alpha;
        // this.fillMaterial.use(context);
        // this.strokeMaterial.use(context);
    }

    private onDispose() {
    }
}