import { Color } from "@ge/common";
import { Light } from "./light";

export class AmbientLight implements Light {

    readonly isLocal = false;
    readonly isAmbient = true;

    constructor(public color: Color) { }

    addReference(_: any): void {
    }

    releaseReference(_: any): void {
    }
}