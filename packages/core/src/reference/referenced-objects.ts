import { ReferencedObject } from "./referenced-object";

const allUnreferencedObjects = new Map<ReferencedObject, () => void>();

class DefaultReferencedObject implements ReferencedObject {

    private readonly referenceByOwner = new Map<any, number>();
    private markedForDeletion = false;

    constructor(private readonly onDelete: () => void) { }

    addReference(owner: any): void {
        const count = this.referenceByOwner.get(owner);
        if (count == undefined) {
            this.referenceByOwner.set(owner, 1);
            if (this.markedForDeletion) {
                allUnreferencedObjects.delete(this);
                this.markedForDeletion = false;
            }
        } else {
            this.referenceByOwner.set(owner, count + 1);
        }
    }

    releaseReference(owner: any): void {
        const count = this.referenceByOwner.get(owner);
        if (count == undefined) {
            throw new RangeError(`There are no references held by ${owner}.`);
        }
        if (count < 2) {
            this.referenceByOwner.delete(owner);
            if (this.referenceByOwner.size === 0) {
                allUnreferencedObjects.set(this, this.onDelete);
                this.markedForDeletion = true;
            }
        } else {
            this.referenceByOwner.set(owner, count - 1);
        }
    }
}

export class ReferencedObjects {

    private constructor() { }

    static create(onDelete: () => void): ReferencedObject {
        return new DefaultReferencedObject(onDelete);
    }

    static deleteSomeUnreferenced(factor: number) {
        let cnt = Math.min(allUnreferencedObjects.size, Math.max(1, Math.floor(allUnreferencedObjects.size * factor)));
        if (cnt > 0) {
            const elements = Array.from(allUnreferencedObjects).slice(0, cnt);
            // TODO this may not be the best performant way.
            elements.forEach(it => allUnreferencedObjects.delete(it[0]));
            elements.forEach(it => it[1]());
        }
    }

    static deleteAllUnreferenced() {
        while (allUnreferencedObjects.size > 0) {
            const elements = Array.from(allUnreferencedObjects);
            allUnreferencedObjects.clear();
            elements.forEach(it => it[1]());
        }
    }
}