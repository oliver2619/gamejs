import { Color, ReferencedObject, Vector3d } from "@ge/common";

export interface Light extends ReferencedObject {

    readonly isLocal: boolean;
    readonly isAmbient: boolean;

    color: Color;
}

export interface LocalLight extends Light {
    position: Vector3d;
}
