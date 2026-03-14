import { AbstractReferencedObject, Color } from "@pluto/core";
import { Light } from "./light";

export class AmbientLight extends AbstractReferencedObject implements Light {

    readonly isLocal = false;
    readonly isAmbient = true;

    constructor(public color: Color) {
        super();
    }

    protected override onDelete(): void { }
}