export interface ReferencedObject {

    addReference(owner: any): void;

    releaseReference(owner: any): void;
}