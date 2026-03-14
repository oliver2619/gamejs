import { CoordSystem3d, ReadonlyColor, ReadonlyVector2d, ReadonlyVector3d } from "@pluto/core";
import { MeshPartBuilder } from "./mesh-part-builder";
import { MeshMode } from "./mesh-mode";
import { MeshBuilderAttributeFunction, MeshBuilderNormalFunction } from "./mesh-builder-functions";

// Motivation: Contains separate set of points with own transformation matrix.
export interface MeshGroupBuilder {
    transform: CoordSystem3d;
    
    reusePoints(reuse: boolean): MeshGroupBuilder;
    point(point: ReadonlyVector3d): number;
    points(...points: ReadonlyVector3d[]): number[];

    attribute(value: number, attribute: number): MeshGroupBuilder;
    attribute(value: ReadonlyVector2d, attribute: number): MeshGroupBuilder;
    attribute(value: ReadonlyVector3d, attribute: number): MeshGroupBuilder;
    attribute(value: ReadonlyColor, attribute: number): MeshGroupBuilder;
    attribute(value: MeshBuilderAttributeFunction, attribute: number): MeshGroupBuilder;
    normal(normal: ReadonlyVector3d): MeshGroupBuilder;
    normal(fn: MeshBuilderNormalFunction): MeshGroupBuilder;

    reuseVertices(reuse: boolean): MeshGroupBuilder;
    vertex(point: ReadonlyVector3d): number;
    vertex(pointIndex: number): number;

    // mesh and groups can have multiple parts with same name.
    addPart(meshMode: MeshMode, name?: string): MeshPartBuilder;
}
