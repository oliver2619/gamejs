import { GarbageCollectibleObject, ReferencedObject } from "core";
import { RenderingContext2d } from "../../render/rendering-context2d";
import { Camera2 } from "../camera2";

export abstract class Layer implements ReferencedObject {

    visible = true;
    
    private readonly reference = new GarbageCollectibleObject(() => this.onDispose());

    get hasReferences(): boolean {
        return this.reference.hasReferences;
    }

    addReference(holder: any) {
        this.reference.addReference(holder);
    }

    releaseReference(holder: any) {
        this.reference.releaseReference(holder);
    }

    abstract preRender(context: RenderingContext2d, globalCamera: Camera2): void;
    
    abstract render(context: RenderingContext2d): void;

    protected onDispose() {
    }
}