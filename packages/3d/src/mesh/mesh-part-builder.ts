import { ReadonlyVector3d } from "@pluto/core";

export interface MeshPartBuilder {
    line(p1: ReadonlyVector3d, p2: ReadonlyVector3d): MeshPartBuilder;
    line(vertexRef1: number, vertexRef2: number): MeshPartBuilder;
    points(...points: ReadonlyVector3d[]): MeshPartBuilder;
    points(...vertexRefs: number[]): MeshPartBuilder;
    quad(p1: ReadonlyVector3d, p2: ReadonlyVector3d, p3: ReadonlyVector3d, p4: ReadonlyVector3d): MeshPartBuilder;
    quad(p1: number, p2: number, p3: number, p4: number): MeshPartBuilder;
    triangle(p1: ReadonlyVector3d, p2: ReadonlyVector3d, p3: ReadonlyVector3d): MeshPartBuilder;
    triangle(p1: number, p2: number, p3: number): MeshPartBuilder;
}
