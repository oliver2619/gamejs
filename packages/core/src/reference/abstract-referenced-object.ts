import { Observable } from "../observable/observable";
import { ReferencedObject } from "./referenced-object";
import { ReferencedObjects } from "./referenced-objects";

export abstract class AbstractReferencedObject implements ReferencedObject {

    private readonly _referencedObject: ReferencedObject = ReferencedObjects.create(() => this.onDelete());

    get onPostDelete(): Observable<void> {
        return this._referencedObject.onPostDelete;
    }

    addReference(owner: any): void {
        this._referencedObject.addReference(owner);
    }

    releaseReference(owner: any): void {
        this._referencedObject.releaseReference(owner);
    }

    protected abstract onDelete(): void;
}