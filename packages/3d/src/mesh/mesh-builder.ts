import { Color, CoordSystem3d, ReadonlyColor, ReadonlyVector2d, ReadonlyVector3d, Vector2d, Vector3d } from "@pluto/core";
import { Mesh, MeshPartData } from "./mesh";
import { Context3d } from "../context";
import { MeshGroupBuilder } from "./mesh-group-builder";
import { MeshBuilderAttributeFunction, MeshBuilderNormalFunction } from "./mesh-builder-functions";
import { MeshPartBuilder } from "./mesh-part-builder";
import { MeshMode } from "./mesh-mode";

interface MeshBuilderConfig {
    readonly attributes: {
        size: 1 | 2 | 3 | 4,
        invertForBackface: boolean,
    }[];
    readonly normal: boolean;
    readonly twoSide: boolean;
}

interface MeshBuilderData {
    readonly attributes: number[][] | undefined;
    readonly indices: number[];
    readonly normals: Vector3d[] | undefined;
    readonly parts: MeshPartData[];
    readonly vertices: Vector3d[];
}

interface MeshBuilderVertexData {
    attributes: number[][];
    normal?: Vector3d | undefined;
    point: Vector3d;
    pointIndex: number;
}

interface MeshGroupBuilderData {
    readonly points: Vector3d[];
    readonly vertices: MeshBuilderVertexData[];
    readonly attributeValues: (number | Vector2d | Vector3d | Color | undefined)[];
    readonly attributeFn: (MeshBuilderAttributeFunction | undefined)[];
    normalValue?: Vector3d | undefined;
    normalFn?: MeshBuilderNormalFunction | undefined;
    reusePoints: boolean;
    reuseVertices: boolean;
    transform: CoordSystem3d;
}

function getOrAddPoint(point: ReadonlyVector3d, groupData: MeshGroupBuilderData): number {
    const transformed = groupData.transform.localToGlobal(point);
    if (groupData.reusePoints) {
        const i = groupData.points.findIndex(it => it.equals(transformed));
        if (i >= 0) {
            return i;
        }
    }
    return groupData.points.push(transformed) - 1;
}

function getOrAddVertex(pointIx: number, meshData: MeshBuilderConfig, groupData: MeshGroupBuilderData): number {
    const v = createVertex(pointIx, meshData, groupData);
    if (groupData.reuseVertices) {
        const i = groupData.vertices.findIndex(it => vertexEquals(it, v));
        if (i >= 0) {
            return i;
        }
    }
    return groupData.vertices.push(v) - 1;
}

function attributeToArray(value: number | ReadonlyVector2d | ReadonlyVector3d | ReadonlyColor, attribute: number, meshData: MeshBuilderConfig): number[] {
    const numComponents = meshData.attributes[attribute]!.size;
    if (typeof value === 'number') {
        if (numComponents !== 1) {
            throw new RangeError(`Attribute layer ${attribute} has ${numComponents} components.`);
        }
        return [value];
    } else {
        if (numComponents === 1) {
            const c = value as ReadonlyColor;
            if (c.a !== undefined) {
                return [c.a];
            } else {
                throw new RangeError(`Illegal type for attribute at layer ${attribute} with ${numComponents} components. Expected color.`);
            }
        } else if (numComponents === 2) {
            const v = value as ReadonlyVector2d;
            if (v.x !== undefined && v.y !== undefined) {
                return [v.x, v.y];
            } else {
                throw new RangeError(`Illegal type for attribute at layer ${attribute} with ${numComponents} components. Expected vector 2d.`);
            }
        } else if (numComponents === 3) {
            const v = value as ReadonlyVector3d;
            const c = value as ReadonlyColor;
            if (v.x !== undefined && v.y !== undefined && v.z !== undefined) {
                return [v.x, v.y, v.z];
            } else if (c.r !== undefined && c.g !== undefined && c.b !== undefined) {
                return [c.r, c.g, c.b];
            } else {
                throw new RangeError(`Illegal type for attribute at layer ${attribute} with ${numComponents} components. Expected color or vector 3d.`);
            }
        } else {
            const c = value as ReadonlyColor;
            if (c.r !== undefined && c.g !== undefined && c.b !== undefined && c.a !== undefined) {
                return [c.r, c.g, c.b, c.a];
            } else {
                throw new RangeError(`Illegal type for attribute at layer ${attribute} with ${numComponents} components. Expected color.`);
            }
        }
    }
}

function createVertex(pointIndex: number, meshData: MeshBuilderConfig, groupData: MeshGroupBuilderData): MeshBuilderVertexData {
    const globalPoint = groupData.points[pointIndex];
    if (globalPoint == undefined) {
        throw new RangeError(`Point ${pointIndex} out of range [0 .. ${groupData.points.length - 1}].`);
    }
    const localPoint = groupData.transform.globalToLocal(globalPoint);
    const localNormal = groupData.normalFn == undefined ? groupData.normalValue : groupData.normalFn({ localPoint, globalPoint }).getNormalized();
    if (meshData.normal && localNormal == undefined) {
        throw new Error('Normal not set.');
    }
    const globalNormal = localNormal == undefined ? undefined : groupData.transform.localDirectionToGlobal(localNormal).getNormalized();
    const attributes = groupData.attributeFn.map((fn, i) => {
        if (fn == undefined) {
            if (groupData.attributeValues[i] == undefined) {
                throw new Error(`Attributes for layer ${i} not set.`);
            }
            return groupData.attributeValues[i];
        } else {
            return fn({ globalPoint, localPoint, globalNormal, localNormal }, groupData.transform);
        }
    }).map((a, i) => attributeToArray(a, i, meshData));
    const v: MeshBuilderVertexData = {
        attributes,
        normal: globalNormal,
        point: globalPoint,
        pointIndex,
    };
    return v;
}

function vertexEquals(v1: MeshBuilderVertexData, v2: MeshBuilderVertexData): boolean {
    if (v1.pointIndex !== v2.pointIndex) {
        return false;
    }
    if (v1.normal != undefined && v2.normal != undefined && !v1.normal.equals(v2.normal)) {
        return false;
    }
    return v1.attributes.every((a1, i) => {
        const a2 = v2.attributes[i]!;
        return a1.length === a2.length && a1.every((a1v, j) => a1v === a2[j]);
    });
}

class MeshPartBuilderImp implements MeshPartBuilder {

    readonly hasBackface: boolean;

    private readonly _indices: number[] = [];

    get indices(): readonly number[] {
        return this._indices;
    }

    constructor(readonly meshMode: MeshMode, readonly name: string | undefined, private readonly meshData: MeshBuilderConfig, private readonly groupData: MeshGroupBuilderData) {
        this.hasBackface = meshData.twoSide && (meshMode === MeshMode.TRIANGLES || meshMode === MeshMode.TRIANGLE_STRIP);
    }

    cloneWithBackface(): MeshPartBuilderImp {
        const ret = new MeshPartBuilderImp(this.meshMode, this.name, this.meshData, this.groupData);
        if (this.meshMode === MeshMode.TRIANGLES) {
            ret.createBackfaceTriangles(this._indices);
        } else if (this.meshMode === MeshMode.TRIANGLE_STRIP) {
            ret.createBackfaceTriangleStrip(this._indices);
        } else {
            throw new Error('Mesh part does not have a backface.');
        }
        return ret;
    }

    getVertexData(): MeshBuilderVertexData[] {
        return this.groupData.vertices;
    }

    checkCorrectNumberOfIndices() {
        if (this._indices.length === 0) {
            throw new Error('Mesh part does not have any vertices.');
        }
        switch (this.meshMode) {
            case MeshMode.LINES:
                if ((this._indices.length % 2) !== 0) {
                    throw new Error('Mesh part with mesh mode lines does not have an equal number of vertices.');
                }
                break;
            case MeshMode.TRIANGLES:
                if ((this._indices.length % 3) !== 0) {
                    throw new Error('Mesh part with mesh mode triangles does not have an integer amount of triangles.');
                }
                break;
            case MeshMode.TRIANGLE_STRIP:
                if (this._indices.length < 3) {
                    throw new Error('Mesh part with mesh mode triangle strip must have at least 3 vertices.');
                }
        }
    }

    line<T extends (ReadonlyVector3d | number)>(p1: T, p2: T): MeshPartBuilder {
        if (this.meshMode === MeshMode.TRIANGLES) {
            throw new Error('Mesh mode TRIANGLES does not accept lines.');
        }
        const v1 = this.pointToVertex(p1);
        const v2 = this.pointToVertex(p2);
        this._indices.push(v1, v2);
        return this;
    }

    points<T extends (ReadonlyVector3d | number)>(...points: T[]): MeshPartBuilder {
        points.forEach(p => this._indices.push(this.pointToVertex(p)));
        return this;
    }

    quad<T extends (ReadonlyVector3d | number)>(p1: T, p2: T, p3: T, p4: T): MeshPartBuilder {
        const v1 = this.pointToVertex(p1);
        const v2 = this.pointToVertex(p2);
        const v3 = this.pointToVertex(p3);
        const v4 = this.pointToVertex(p4);
        switch (this.meshMode) {
            case MeshMode.LINES:
                this._indices.push(v1, v2, v2, v3, v3, v4, v4, v1);
                break;
            case MeshMode.POINTS:
                this._indices.push(v1, v2, v3, v4);
                break;
            case MeshMode.TRIANGLES:
                this._indices.push(v1, v2, v4, v2, v3, v4);
                break;
            case MeshMode.TRIANGLE_STRIP:
                this._indices.push(v1, v2, v4, v3);
                break;
        }
        return this;
    }

    triangle<T extends (ReadonlyVector3d | number)>(p1: T, p2: T, p3: T): MeshPartBuilder {
        const v1 = this.pointToVertex(p1);
        const v2 = this.pointToVertex(p2);
        const v3 = this.pointToVertex(p3);
        if (this.meshMode === MeshMode.LINES) {
            this._indices.push(v1, v2, v2, v3, v3, v1);
        } else {
            this._indices.push(v1, v2, v3);
        }
        return this;
    }

    private createBackfaceTriangles(indices: number[]) {
        const cnt = indices.length;
        for (let i = 0; i < cnt; i += 3) {
            // swap orientation
            this._indices.push(this.getOrCreateBackfaceVertex(indices[i]!));
            this._indices.push(this.getOrCreateBackfaceVertex(indices[i + 2]!));
            this._indices.push(this.getOrCreateBackfaceVertex(indices[i + 1]!));
        }
    }

    private createBackfaceTriangleStrip(indices: number[]) {
        // swap orientation
        const cnt = indices.length;
        for (let i = cnt - 1; i >= 0; --i) {
            this._indices.push(this.getOrCreateBackfaceVertex(indices[i]!));
        }
    }

    private getOrCreateBackfaceVertex(vertex: number): number {
        const vf = this.groupData.vertices[vertex]!;
        const vb: MeshBuilderVertexData = {
            attributes: vf.attributes.map((attribVector, layer) => this.meshData.attributes[layer]!.invertForBackface ? attribVector.map(a => -a) : attribVector.slice(0)),
            point: vf.point,
            pointIndex: vf.pointIndex,
            normal: vf.normal?.getScaled(-1),
        };
        const found = this.groupData.vertices.findIndex(v => vertexEquals(v, vb));
        if (found >= 0) {
            return found;
        }
        return this.groupData.vertices.push(vb) - 1;
    }

    private pointToVertex(point: ReadonlyVector3d | number): number {
        if (typeof point === 'number') {
            return point;
        }
        const pt = getOrAddPoint(point, this.groupData);
        return getOrAddVertex(pt, this.meshData, this.groupData);
    }
}

class MeshGroupBuilderImp implements MeshGroupBuilder {

    private readonly groupData: MeshGroupBuilderData;
    private readonly parts: MeshPartBuilderImp[] = [];

    get transform(): CoordSystem3d {
        return this.groupData.transform;
    }

    set transform(t: CoordSystem3d) {
        this.groupData.transform = t;
    }

    constructor(private readonly meshData: MeshBuilderConfig) {
        this.groupData = {
            points: [],
            vertices: [],
            attributeValues: new Array(meshData.attributes.length),
            attributeFn: new Array(meshData.attributes.length),
            reusePoints: false,
            reuseVertices: false,
            transform: new CoordSystem3d({}),
        };
    }

    build(result: MeshBuilderData) {
        const backfaceParts: MeshPartBuilderImp[] = [];
        this.parts.forEach(part => {
            part.checkCorrectNumberOfIndices();
            if (part.hasBackface) {
                backfaceParts.push(part.cloneWithBackface());
            }
        });
        const allParts = [...this.parts, ...backfaceParts];
        const vertexBase = result.vertices.length;
        this.groupData.vertices.forEach(v => {
            result.vertices.push(v.point);
            if (result.attributes != undefined) {
                v.attributes.forEach((att, i) => result.attributes![i]!.push(...att));
            }
            if (result.normals != undefined && v.normal != undefined) {
                result.normals.push(v.normal);
            }
        });
        allParts.forEach(part => {
            const indexBase = result.indices.length;
            part.indices.forEach(i => result.indices.push(i + vertexBase));
            result.parts.push({
                meshMode: part.meshMode,
                startIndex: indexBase,
                indexCount: part.indices.length,
                name: part.name,
            });
        });
    }

    reusePoints(reuse: boolean): MeshGroupBuilder {
        this.groupData.reusePoints = reuse;
        return this;
    }

    point(point: ReadonlyVector3d): number {
        return getOrAddPoint(point, this.groupData);
    }

    points(...points: ReadonlyVector3d[]): number[] {
        return points.map(it => getOrAddPoint(it, this.groupData));
    }

    attribute(value: number | ReadonlyVector2d | ReadonlyVector3d | ReadonlyColor | MeshBuilderAttributeFunction, attribute: number): MeshGroupBuilder {
        if (attribute < 0 || attribute >= this.meshData.attributes.length) {
            throw new RangeError(`Attribute layer ${attribute} out of range [0 .. ${this.meshData.attributes.length - 1}]`);
        }
        if (typeof value === 'function') {
            this.groupData.attributeFn[attribute] = value;
            this.groupData.attributeValues[attribute] = undefined;
        } else {
            this.groupData.attributeFn[attribute] = undefined;
            if (typeof value === 'number') {
                this.groupData.attributeValues[attribute] = value;
            } else {
                this.groupData.attributeValues[attribute] = value.clone();
            }
        }
        return this;
    }

    normal(normal: ReadonlyVector3d | MeshBuilderNormalFunction): MeshGroupBuilder {
        if (!this.meshData.normal) {
            throw new RangeError('Normals not allowed for this mesh.');
        }
        if (typeof normal === 'function') {
            this.groupData.normalFn = normal;
            this.groupData.normalValue = undefined;
        } else {
            this.groupData.normalFn = undefined;
            this.groupData.normalValue = normal.getNormalized();
        }
        return this;
    }

    reuseVertices(reuse: boolean): MeshGroupBuilder {
        this.groupData.reuseVertices = reuse;
        return this;
    }

    vertex(point: ReadonlyVector3d | number): number {
        const pointIx = typeof point === 'number' ? point : getOrAddPoint(point, this.groupData);
        return getOrAddVertex(pointIx, this.meshData, this.groupData);
    }

    addPart(meshMode: MeshMode, name?: string): MeshPartBuilder {
        const ret = new MeshPartBuilderImp(meshMode, name, this.meshData, this.groupData);
        this.parts.push(ret);
        return ret;
    }
}

export class MeshBuilder {

    private readonly data: MeshBuilderConfig;
    private readonly groups: MeshGroupBuilderImp[] = [];

    constructor(data: {
        attributes?: {
            size: 1 | 2 | 3 | 4,
            invertForBackface?: boolean,
        }[],
        normal?: boolean,
        twoSide?: boolean,
    }) {
        this.data = {
            attributes: data.attributes?.map(a => ({ ...a, invertForBackface: a.invertForBackface ?? false, })) ?? [],
            normal: data.normal ?? false,
            twoSide: data.twoSide ?? false,
        };
    }

    addGroup(): MeshGroupBuilder {
        const ret = new MeshGroupBuilderImp(this.data);
        this.groups.push(ret);
        return ret;
    }

    build(data: {
        castShadow?: boolean | undefined;
        context: Context3d;
        modifiable?: boolean | undefined,
        receiveShadow?: boolean | undefined;
        visible?: boolean | undefined;
    }): Mesh {
        const result: MeshBuilderData = {
            attributes: this.data.attributes.length > 0 ? new Array(this.data.attributes.length) : undefined,
            indices: [],
            vertices: [],
            normals: this.data.normal ? [] : undefined,
            parts: [],
        };
        this.groups.forEach(it => it.build(result));
        this.groups.splice(0, this.groups.length);
        return Mesh.fromArrays({
            context: data.context,
            indices: result.indices,
            parts: result.parts,
            vertices: result.vertices,
            attributes: result.attributes,
            castShadow: data.castShadow,
            modifiable: data.modifiable,
            normals: result.normals,
            receiveShadow: data.receiveShadow,
            visible: data.visible,
        });
    }
}
