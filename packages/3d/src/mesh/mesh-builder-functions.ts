import { Color, ReadonlyCoordSystem3d, ReadonlyVector3d, Vector2d, Vector3d } from "@pluto/core";

export type MeshBuilderNormalFunction = (vertex: {
    readonly localPoint: ReadonlyVector3d,
    readonly globalPoint: ReadonlyVector3d,
}) => Vector3d;

export type MeshBuilderAttributeFunction = (vertex: {
    readonly localPoint: ReadonlyVector3d,
    readonly globalPoint: ReadonlyVector3d,
    readonly localNormal?: ReadonlyVector3d | undefined,
    readonly globalNormal?: ReadonlyVector3d | undefined,
}, transform: ReadonlyCoordSystem3d) => number | Vector2d | Vector3d | Color;
