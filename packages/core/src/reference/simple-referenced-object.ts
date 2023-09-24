import { ReferencedObject } from "./referenced-object";

export interface SimpleReferencedObjectData {
    onAddFirstReference?: () => void;
    onReleaseLastReference?: () => void;
}

export class SimpleReferencedObject implements ReferencedObject {

    private readonly references = new Map<any, number>();
    private readonly onAddFirstReference: () => void;
    private readonly onReleaseLastReference: () => void;

    get hasReferences(): boolean {
        return this.references.size > 0;
    }

    constructor(data?: SimpleReferencedObjectData) {
        this.onAddFirstReference = data == undefined || data.onAddFirstReference == undefined ? () => { } : data.onAddFirstReference;
        this.onReleaseLastReference = data == undefined || data.onReleaseLastReference == undefined ? () => { } : data.onReleaseLastReference;
    }

    addReference(holder: any): void {
        const found = this.references.get(holder);
        if (found == undefined) {
            this.references.set(holder, 1);
            if (this.references.size === 1) {
                this.onAddFirstReference();
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
                    this.onReleaseLastReference();
                }
            }
        }
    }

}