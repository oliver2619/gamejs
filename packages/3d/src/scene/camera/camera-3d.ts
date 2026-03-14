import { ReadonlyVector3d } from "@pluto/core";

export interface Camera3d {

    setTargetDirection(direction: ReadonlyVector3d, up: ReadonlyVector3d): void;
}