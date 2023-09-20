import {ReferencedObject} from "./referenced-object";
import {GarbageCollector} from "./garbage-collector";

enum ReferencedObjectState {
    CREATED, GC, DISPOSED
}

export class DefaultReferencedObject implements ReferencedObject {

    private readonly references = new Map<any, number>();

    private state: ReferencedObjectState = ReferencedObjectState.CREATED;

    get hasReferences(): boolean {
        return this.references.size > 0;
    }

    constructor(private readonly onDispose: () => void) {
    }

    addReference(holder: any): void {
        if (this.state === ReferencedObjectState.DISPOSED) {
            throw new Error("Object has already been disposed and cannot be recycled again.");
        }
        const found = this.references.get(holder);
        if (found == undefined) {
            this.references.set(holder, 1);
            if (this.references.size === 1 && this.state === ReferencedObjectState.GC) {
                GarbageCollector.recycleObject(this);
                this.state = ReferencedObjectState.CREATED;
            }
        } else {
            this.references.set(holder, found + 1);
        }
    }

    releaseReference(holder: any): void {
        const found = this.references.get(holder);
        if (found == undefined) {
            console.warn('Object was not referenced by given holder');
        } else {
            if (found > 1) {
                this.references.set(holder, found - 1);
            } else {
                this.references.delete(holder);
                if (this.references.size === 0) {
                    GarbageCollector.scheduleObjectForDisposal(this, () => {
                        this.state = ReferencedObjectState.DISPOSED;
                        this.onDispose();
                    });
                    this.state = ReferencedObjectState.GC;
                }
            }
        }
    }

}