import { Observable } from "../observable";

export interface ReferencedObject {
    readonly onPostDelete: Observable<void>;
    addReference(owner: any): void;
    releaseReference(owner: any): void;
}