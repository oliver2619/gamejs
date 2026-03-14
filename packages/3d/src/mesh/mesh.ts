import { AbstractReferencedObject, Box3d, ReadonlyBox3d, ReadonlyVector3d } from "@pluto/core";
import { Context3d } from "../context";
import { MeshMode } from "./mesh-mode";
import { VertexBuffer } from "./vertex-buffer";
import { IndexBuffer } from "./index-buffer";
import { VertexArrayObject } from "./vertex-array-object";
import { AttributeLocation } from "./attribute-location";

export interface MeshPartData {
    readonly name?: string | undefined;
    readonly meshMode: MeshMode;
    readonly startIndex: number;
    readonly indexCount: number;
}

class MeshPart {

    visible = true;

    constructor(readonly meshMode: MeshMode, readonly startIndex: number, readonly indexCount: number) { }
}

export class Mesh extends AbstractReferencedObject {

    visible: boolean;
    castShadow: boolean;
    receiveShadow: boolean;

    private readonly vertexBuffer: VertexBuffer;
    private readonly indices: IndexBuffer;
    private readonly vao: VertexArrayObject;
    private readonly _boundingBox: Box3d = Box3d.empty();
    private readonly parts: readonly MeshPart[];
    private readonly partsByName = new Map<string, MeshPart[]>();

    get boundingBox(): ReadonlyBox3d {
        return this._boundingBox;
    }

    private constructor(data: {
        attributes: { offset: number, size: number }[] | undefined,
        castShadow?: boolean | undefined,
        gl: WebGL2RenderingContext,
        interleavedArray: number[],
        indices: number[],
        normalOffset: number | undefined,
        modifiable?: boolean | undefined,
        parts: readonly MeshPartData[],
        receiveShadow?: boolean | undefined,
        visible?: boolean | undefined,
    }) {
        super();
        this.castShadow = data.castShadow ?? false;
        this.receiveShadow = data.receiveShadow ?? false;
        this.visible = data.visible ?? true;

        const itemSize = 3 + (data.normalOffset == undefined ? 0 : 3) + (data.attributes?.reduce((prev, cur) => cur.size + prev, 0) ?? 0);

        // create objects
        this.vertexBuffer = new VertexBuffer({ gl: data.gl, vertices: new Float32Array(data.interleavedArray), modifiable: data.modifiable });
        this.indices = new IndexBuffer({ gl: data.gl, indices: new Int16Array(data.indices) });
        this.vao = new VertexArrayObject({
            gl: data.gl,
            vertexBuffer: this.vertexBuffer,
            init: gl => {
                gl.enableVertexAttribArray(AttributeLocation.VERTEX);
                gl.vertexAttribPointer(AttributeLocation.VERTEX, 3, WebGLRenderingContext.FLOAT, false, itemSize * 4, 0);
                if (data.normalOffset != undefined) {
                    gl.enableVertexAttribArray(AttributeLocation.NORMAL);
                    gl.vertexAttribPointer(AttributeLocation.NORMAL, 3, WebGLRenderingContext.FLOAT, false, itemSize * 4, data.normalOffset * 4);
                }
                if (data.attributes != undefined) {
                    data.attributes.forEach((a, i) => {
                        gl.enableVertexAttribArray(AttributeLocation.ATTRIBUTE0 + i);
                        gl.vertexAttribPointer(AttributeLocation.ATTRIBUTE0 + i, a.size, WebGLRenderingContext.FLOAT, false, itemSize * 4, a.offset * 4);
                    });
                }
            }
        });
        this.vertexBuffer.addReference(this);
        this.indices.addReference(this);
        this.vao.addReference(this);

        // parts
        const parts: MeshPart[] = [];
        data.parts.forEach(pd => {
            const part = new MeshPart(pd.meshMode, pd.startIndex, pd.indexCount);
            parts.push(part);
            if (pd.name != undefined) {
                const pl = this.partsByName.get(pd.name);
                if (pl == undefined) {
                    this.partsByName.set(pd.name, [part]);
                } else {
                    pl.push(part);
                }

            }
        });
        this.parts = parts;
    }

    static fromArrays(data: {
        attributes?: number[][] | undefined;
        context: Context3d;
        castShadow?: boolean | undefined;
        parts: MeshPartData[];
        modifiable?: boolean | undefined;
        indices: number[];
        normals?: readonly ReadonlyVector3d[] | undefined;
        receiveShadow?: boolean | undefined;
        vertices: readonly ReadonlyVector3d[];
        visible?: boolean | undefined;
    }): Mesh {
        const verticesCount = data.vertices.length;

        // checks
        if (verticesCount === 0) {
            throw new RangeError('No vertices defined.');
        }
        if (data.normals != undefined && verticesCount !== data.normals.length) {
            throw new RangeError('Length of normal array does not match to length of vertex array.');
        }
        if (data.attributes != undefined) {
            if (data.attributes.some(a => a.length !== verticesCount * 4 && a.length !== verticesCount * 3 && a.length !== verticesCount * 2 && a.length !== verticesCount)) {
                throw new RangeError('Length of attribute array does not match to a multiple length of vertex array.');
            }
        }

        // create interleaved array
        const boundingBox = Box3d.empty();
        const attribsSizes = data.attributes == undefined ? [] : data.attributes.map(a => a.length / verticesCount | 0);
        const attribsOffsets: number[] = new Array(attribsSizes.length);
        attribsSizes.forEach((_, i) => attribsOffsets[i] = i > 0 ? attribsOffsets[i - 1]! + attribsSizes[i - 1]! : (data.normals == undefined ? 3 : 6));
        const interleavedArray: number[] = [];
        data.vertices.forEach((v, i) => {
            interleavedArray.push(v.x, v.y, v.z);
            boundingBox.extendByPoint(v);
            if (data.normals != undefined) {
                const n = data.normals[i]!;
                interleavedArray.push(n.x, n.y, n.z);
            }
            if (data.attributes != undefined) {
                data.attributes.forEach((att, layer) => {
                    const sz = attribsSizes[layer]!;
                    const a0 = i * sz;
                    for (let j = 0; j < sz; ++j) {
                        interleavedArray.push(att[a0 + j]!);
                    }
                });
            }
        });
        return Mesh.fromInterleavedArray({
            context: data.context,
            indices: data.indices,
            interleavedArray,
            parts: data.parts,
            attributes: attribsSizes.map((size, i) => ({ offset: attribsOffsets[i]!, size })),
            castShadow: data.castShadow,
            modifiable: data.modifiable,
            normalOffset: data.normals == undefined ? undefined : 3,
            receiveShadow: data.receiveShadow,
            visible: data.visible,
        });
    }

    static fromInterleavedArray(data: {
        attributes?: { offset: number, size: number, }[] | undefined,
        context: Context3d,
        castShadow?: boolean | undefined,
        parts: MeshPartData[],
        modifiable?: boolean | undefined,
        normalOffset?: number | undefined,
        indices: number[],
        interleavedArray: number[],
        receiveShadow?: boolean | undefined,
        visible?: boolean | undefined,
    }): Mesh {
        return new Mesh({
            attributes: data.attributes,
            gl: data.context.gl,
            indices: data.indices,
            interleavedArray: data.interleavedArray,
            modifiable: data.modifiable,
            normalOffset: data.normalOffset,
            parts: data.parts,
            castShadow: data.castShadow,
            receiveShadow: data.receiveShadow,
            visible: data.visible,
        });
    }

    render(): void {
        this.vao.use(() => {
            this.indices.begin();
            try {
                this.parts.forEach(g => {
                    if (g.visible) {
                        this.indices.renderRange(g.meshMode, g.startIndex, g.indexCount);
                    }
                });
            } finally {
                this.indices.end();
            }
        });
    }

    setVisible(partName: string, visible: boolean) {
        this.partsByName.get(partName)?.forEach(p => p.visible = visible);
    }

    protected onDelete() {
        this.vertexBuffer.releaseReference(this);
        this.indices.releaseReference(this);
        this.vao.releaseReference(this);
    }
}