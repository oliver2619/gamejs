export interface ReferencedObject {

    readonly hasReferences: boolean;

    addReference(holder: any): void;

    releaseReference(holder: any): void;
}