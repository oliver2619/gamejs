import { Observable, ReadonlyBox2d, ReferencedObject } from "@pluto/core";
import { Blend2dOperation } from "../../render/blend-2d-operation";

export interface Object2dPart extends ReferencedObject {

    readonly boundingBox: ReadonlyBox2d;
    readonly onBoundingBoxChanged: Observable<void>;
    readonly onVisibilityChanged: Observable<void>;

    alpha: number;
    blendOperation: Blend2dOperation | undefined;
    visible: boolean;

    render(): void;
}