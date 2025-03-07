import { AbstractReferencedObject } from "@pluto/core";
import { Object2d } from "../scene";

export class Object2dResource extends AbstractReferencedObject {

    constructor(private readonly object: Object2d) {
        super();
        object.addReference(this);
    }

    createInstance(): Object2d {
        return this.object.clone();
    }

    protected onDelete(): void {
        this.object.releaseReference(this);
    }
}