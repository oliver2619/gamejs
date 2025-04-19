import { CoordSystem2d, ReadonlyBox2d, ReadonlyCoordSystem2d } from "@pluto/core";

export interface ReadonlyObject2dBase {
    readonly coordSystem: ReadonlyCoordSystem2d;
    readonly boundingBox: ReadonlyBox2d;
}

export interface Object2dBase extends ReadonlyObject2dBase {
    updateCoordSystem(callback: (coordSystem: CoordSystem2d) => void): void;
}