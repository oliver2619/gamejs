import { Color, ReferencedObject, ReferencedObjects, Vector3d } from "@ge/common";
import { Context3d } from "../context/context-3d";

export enum VertexArrayMode {
    LINES = WebGLRenderingContext.LINES,
    LINE_LOOP = WebGLRenderingContext.LINE_LOOP,
    LINE_STRIP = WebGLRenderingContext.LINE_STRIP,
    POINTS = WebGLRenderingContext.POINTS,
    TRIANGLES = WebGLRenderingContext.TRIANGLES,
    TRIANGLE_FAN = WebGLRenderingContext.TRIANGLE_FAN,
    TRIANGLE_STRIP = WebGLRenderingContext.TRIANGLE_STRIP
}

export class VertexArrayGroup {

    constructor(private readonly mode: VertexArrayMode, indicees: number[], normals: Vector3d[], tangents: Vector3d[][], texCoords: Vector3d[][], colors: Color[][], attributes: number[][]) {}

    render() {

    }
}

export class VertexArray implements ReferencedObject {

    private readonly referencedObject = ReferencedObjects.create(() => this.onDestroy());

    get numberOfGroups(): number {
        return this._groups.length;
    }

    constructor(private readonly context: Context3d, private readonly points: Vector3d[], private readonly _groups: VertexArrayGroup[]) {}

    addReference(owner: any): void {
        this.referencedObject.addReference(owner);
    }

    releaseReference(owner: any): void {
        this.referencedObject.releaseReference(owner);
    }

    renderAll() {
        // TODO use points
        this._groups.forEach(it => it.render());
    }

    renderGroup(group: number) {
        // TODO use points
        this._groups[group]!.render();
    }

    private onDestroy() {

    }
}