import { EventObservable } from "../observable/event-observable";
import { ReferencedObject } from "./referenced-object";

enum ReferencedObjectState {
    CREATED, MARKED_FOR_DELETION, DELETED
}

const allUnreferencedObjects = new Set<DefaultReferencedObject>();

class DefaultReferencedObject implements ReferencedObject {

    readonly onPostDelete = new EventObservable<void>();
    private readonly referenceByOwner = new Map<any, number>();
    private state: ReferencedObjectState = ReferencedObjectState.CREATED;

    constructor(private readonly onDelete: () => void) { }

    addReference(owner: any): void {
        if (this.state === ReferencedObjectState.DELETED) {
            throw new Error("Object has already been deleted and cannot be recycled again.");
        }
        const count = this.referenceByOwner.get(owner);
        if (count == undefined) {
            this.referenceByOwner.set(owner, 1);
            if (this.state === ReferencedObjectState.MARKED_FOR_DELETION) {
                allUnreferencedObjects.delete(this);
                this.state = ReferencedObjectState.CREATED;
            }
        } else {
            this.referenceByOwner.set(owner, count + 1);
        }
    }

    delete() {
        this.state = ReferencedObjectState.DELETED;
        this.onDelete();
        this.onPostDelete.next();
    }

    releaseReference(owner: any): void {
        const count = this.referenceByOwner.get(owner);
        if (count == undefined) {
            throw new RangeError(`There are no references held by ${owner}.`);
        }
        if (count < 2) {
            this.referenceByOwner.delete(owner);
            if (this.referenceByOwner.size === 0) {
                allUnreferencedObjects.add(this);
                this.state = ReferencedObjectState.MARKED_FOR_DELETION;
            }
        } else {
            this.referenceByOwner.set(owner, count - 1);
        }
    }
}

export class ReferencedObjects {

    get gcSize(): number {
        return allUnreferencedObjects.size;
    }

    private constructor() { }

    static create(onDelete?: () => void): ReferencedObject {
        return new DefaultReferencedObject(onDelete ?? (() => { }));
    }

    static deleteSomeUnreferenced(factor: number) {
        let cnt = Math.min(allUnreferencedObjects.size, Math.max(1, Math.floor(allUnreferencedObjects.size * factor)));
        if (cnt > 0) {
            const elements = Array.from(allUnreferencedObjects).slice(0, cnt);
            // TODO this may not be the best performant way.
            elements.forEach(it => allUnreferencedObjects.delete(it));
            elements.forEach(it => it.delete());
        }
    }

    static deleteAllUnreferenced() {
        while (allUnreferencedObjects.size > 0) {
            const elements = Array.from(allUnreferencedObjects);
            allUnreferencedObjects.clear();
            elements.forEach(it => it.delete());
        }
    }
}