import { CoordSystem2d, ReadonlyBox2d, ReadonlyCoordSystem2d } from "@pluto/core";

export interface Object2dBase {
    readonly coordSystem: ReadonlyCoordSystem2d;
    readonly boundingBox: ReadonlyBox2d;
    updateCoordSystem(callback: (coordSystem: CoordSystem2d) => void): void;
}