import { ReadonlyVector3d } from "@pluto/core";
import { Camera3d } from "./camera-3d";

export class PerspectiveCamera implements Camera3d {
    setTargetDirection(_direction: ReadonlyVector3d, _up: ReadonlyVector3d): void {
        throw new Error("Method not implemented.");
    }

}