import { Color, ReadonlyVector3d, Vector3d } from "@ge/common";
import { VertexArray, VertexArrayGroup, VertexArrayMode } from "./vertex-array";
import { Context3d } from "../context/context-3d";

class VertexArrayElement {

    constructor(
        readonly point: number,
        readonly normal: Vector3d,
        readonly texCoords: Vector3d[],
        readonly tangents: Vector3d[],
        readonly colors: Color[],
        readonly attributes: number[]
    ) { }
}

export interface VertexArrayGroupBuilder {
    attribute(index: number, value: number): VertexArrayGroupBuilder;
    attribute(index: number, mapping: (vertex: ReadonlyVector3d, normal: ReadonlyVector3d) => number): VertexArrayGroupBuilder;
    color(layer: number, r: number, g: number, b: number): VertexArrayGroupBuilder;
    color(layer: number, r: number, g: number, b: number, a: number): VertexArrayGroupBuilder;
    color(layer: number, c: Color): VertexArrayGroupBuilder;
    color(layer: number, mapping: (vertex: ReadonlyVector3d, normal: ReadonlyVector3d) => Color): VertexArrayGroupBuilder;
    normal(x: number, y: number, z: number): VertexArrayGroupBuilder;
    normal(n: ReadonlyVector3d): VertexArrayGroupBuilder;
    normal(mapping: (vertex: ReadonlyVector3d) => Vector3d): VertexArrayGroupBuilder;
    tangent(layer: number, x: number, y: number, z: number): VertexArrayGroupBuilder;
    tangent(layer: number, t: ReadonlyVector3d): VertexArrayGroupBuilder;
    tangent(layer: number, mapping: (vertex: ReadonlyVector3d, normal: ReadonlyVector3d) => Vector3d): VertexArrayGroupBuilder;
    texCoords(layer: number, x: number, y: number): VertexArrayGroupBuilder;
    texCoords(layer: number, x: number, y: number, z: number): VertexArrayGroupBuilder;
    texCoords(layer: number, mapping: (vertex: ReadonlyVector3d, normal: ReadonlyVector3d, tangent: ReadonlyVector3d) => Vector3d): VertexArrayGroupBuilder;
    texCoords(layer: number, c: ReadonlyVector3d): VertexArrayGroupBuilder;
    vertex(x: number, y: number, z: number): VertexArrayGroupBuilder;
    vertex(v: ReadonlyVector3d): VertexArrayGroupBuilder;
    vertexRef(pointRef: number): VertexArrayGroupBuilder;
}

class VertexArrayGroupBuilderImpl implements VertexArrayGroupBuilder {

    private readonly elements: VertexArrayElement[] = [];

    private readonly currentNormal = new Vector3d(0, 0, 1);
    private normalMapping: ((vertex: ReadonlyVector3d) => Vector3d) | undefined;

    private readonly currentTangents: Vector3d[];
    private readonly tangentMappings: Array<((vertex: ReadonlyVector3d, normal: ReadonlyVector3d) => Vector3d) | undefined>;

    private readonly currentTexCoords: Vector3d[];
    private readonly texCoordsMappings: Array<((vertex: ReadonlyVector3d, normal: ReadonlyVector3d, tangent: ReadonlyVector3d) => Vector3d) | undefined>;

    private readonly currentColors: Color[];
    private readonly colorMappings: Array<((vertex: ReadonlyVector3d, normal: ReadonlyVector3d) => Color) | undefined>;

    private readonly currentAttributes: number[];
    private readonly attributeMappings: Array<((vertex: ReadonlyVector3d, normal: ReadonlyVector3d) => number) | undefined>;

    constructor(private readonly mode: VertexArrayMode, private readonly points: Vector3d[], textureLayers: number, colors: number, attributes: number) {
        this.currentTangents = new Array(textureLayers);
        this.tangentMappings = new Array(textureLayers);
        this.currentTangents.forEach((_, i) => this.currentTangents[i] = new Vector3d(0, 1, 0));

        this.currentTexCoords = new Array(textureLayers);
        this.texCoordsMappings = new Array(textureLayers);
        this.currentTexCoords.forEach((_, i) => this.currentTexCoords[i] = new Vector3d(0, 0, 0));

        this.currentColors = new Array(colors);
        this.colorMappings = new Array(colors);
        this.currentColors.forEach((_, i) => this.currentColors[i] = new Color(1, 1, 1));

        this.currentAttributes = new Array(attributes);
        this.attributeMappings = new Array(attributes);
        this.currentAttributes.forEach((_, i) => this.currentAttributes[i] = 0);
    }

    attribute(index: number, ...args: any[]): VertexArrayGroupBuilder {
        if (index < 0 || index >= this.currentAttributes.length) {
            throw new RangeError(`Index ${index} out of bounds 0..${this.currentAttributes.length - 1}.`);
        }
        if (typeof args[0] === 'number') {
            this.attributeMappings[index] = undefined;
            this.currentAttributes[index] = args[0];
        } else {
            this.attributeMappings[index] = args[0];
        }
        return this;
    }

    build(): VertexArrayGroup {
        if (this.mode === VertexArrayMode.POINTS && this.elements.length < 1) {
            throw new Error('At least one vertex must be defined in a group for mode POINTS.');
        }
        if ((this.mode === VertexArrayMode.LINES || this.mode === VertexArrayMode.LINE_LOOP || this.mode === VertexArrayMode.LINE_STRIP) && this.elements.length < 2) {
            throw new Error('At least two vertices must be defined in a group for any line mode.');
        }
        if (this.mode === VertexArrayMode.LINES && (this.elements.length % 2) !== 0) {
            throw new Error('Number of vertices in mode LINES must be a multiple of two.');
        }
        if ((this.mode === VertexArrayMode.TRIANGLES || this.mode === VertexArrayMode.TRIANGLE_FAN || this.mode === VertexArrayMode.TRIANGLE_STRIP) && this.elements.length < 3) {
            throw new Error('At least three vertices must be defined in a group for any triangle mode.');
        }
        if (this.mode === VertexArrayMode.TRIANGLES && (this.elements.length % 3) !== 0) {
            throw new Error('Number of vertices in mode TRIANGLES must be a multiple of three.');
        }
        return new VertexArrayGroup(this.mode, this.elements.map(it => it.point));
    }

    color(layer: number, ...args: any[]): VertexArrayGroupBuilder {
        if (layer < 0 || layer >= this.currentColors.length) {
            throw new RangeError(`Color layer ${layer} out of bounds 0..${this.currentColors.length - 1}.`);
        }
        if (typeof args[0] === 'number') {
            this.colorMappings[layer] = undefined;
            this.currentColors[layer]!.set(args[0], args[1], args[2]);

        } else if (typeof args[0] === 'function') {
            this.colorMappings[layer] = args[0];
        } else {
            this.colorMappings[layer] = undefined;
            this.currentColors[layer]!.set(args[0]);
        }
        return this;
    }

    normal(...args: any[]): VertexArrayGroupBuilder {
        if (typeof args[0] === 'number') {
            this.normalMapping = undefined;
            this.currentNormal.set(args[0], args[1], args[2]);
            this.currentNormal.normalize();
        } else if (typeof args[0] === 'function') {
            this.normalMapping = args[0];
        } else {
            this.normalMapping = undefined;
            this.currentNormal.set(args[0]);
            this.currentNormal.normalize();
        }
        return this;
    }

    tangent(layer: number, ...args: any[]): VertexArrayGroupBuilder {
        if (layer < 0 || layer >= this.currentTangents.length) {
            throw new RangeError(`Texture layer ${layer} out of bounds 0..${this.currentTangents.length - 1}.`);
        }
        if (typeof args[0] === 'number') {
            this.tangentMappings[layer] = undefined;
            this.currentTangents[layer]!.set(args[0], args[1], args[2]);
            this.currentTangents[layer]!.normalize();

        } else if (typeof args[0] === 'function') {
            this.tangentMappings[layer] = args[0];
        } else {
            this.tangentMappings[layer] = undefined;
            this.currentTangents[layer]!.set(args[0]);
            this.currentTangents[layer]!.normalize();
        }
        return this;
    }

    texCoords(layer: number, ...args: any[]): VertexArrayGroupBuilder {
        if (layer < 0 || layer >= this.currentTexCoords.length) {
            throw new RangeError(`Texture layer ${layer} out of bounds 0..${this.currentTexCoords.length - 1}.`);
        }
        if (typeof args[0] === 'number') {
            this.texCoordsMappings[layer] = undefined;
            this.currentTexCoords[layer]!.x = args[0];
            this.currentTexCoords[layer]!.y = args[1];
            if (args[2] != undefined) {
                this.currentTexCoords[layer]!.z = args[2];
            }
        } else if (typeof args[0] === 'function') {
            this.texCoordsMappings[layer] = args[0];
        } else {
            this.texCoordsMappings[layer] = undefined;
            this.currentTexCoords[layer]!.set(args[0]);
        }
        return this;
    }

    vertex(...args: any[]): VertexArrayGroupBuilder {
        let v: Vector3d;
        if (typeof args[0] === 'number') {
            v = new Vector3d(args[0], args[1], args[2]);
        } else {
            v = args[0].clone();
        }
        const index = this.points.findIndex(it => it.x === v.x && it.y === v.y && it.z === v.z);
        if (index >= 0) {
            return this.vertexRef(index);
        }
        let newIndex = this.points.push(v) - 1;
        return this.vertexRef(newIndex);
    }

    vertexRef(pointRef: number): VertexArrayGroupBuilder {
        if (pointRef < 0 || pointRef >= this.points.length) {
            throw new RangeError(`Point with index ${pointRef} not found.`);
        }
        const point = this.points[pointRef]!;
        if (this.normalMapping != undefined) {
            this.currentNormal.set(this.normalMapping(point).normalized());
        }
        this.tangentMappings.forEach((m, i) => {
            if (m != undefined) {
                this.currentTangents[i]!.set(m(point, this.currentNormal).normalized());
            }
        });
        this.texCoordsMappings.forEach((m, i) => {
            if (m != undefined) {
                this.currentTexCoords[i]!.set(m(point, this.currentNormal, this.currentTangents[i]!));
            }
        });
        this.colorMappings.forEach((m, i) => {
            if (m != undefined) {
                this.currentColors[i]!.set(m(point, this.currentNormal));
            }
        });
        this.attributeMappings.forEach((m, i) => {
            if (m != undefined) {
                this.currentAttributes[i] = m(point, this.currentNormal);
            }
        });
        this.elements.push(new VertexArrayElement(pointRef, this.currentNormal.clone(), this.currentTexCoords.map(it => it.clone()), this.currentTangents.map(it => it.clone()), this.currentColors.map(it => it.clone()), attributes));
        return this;
    }
}

export class VertexArrayBuilder {

    private points: Vector3d[] = [];
    private groups: VertexArrayGroupBuilderImpl[] = [];

    constructor(private readonly textureLayers: number, private readonly colors: number, private readonly attributes: number) {
        if (textureLayers < 0) {
            throw new RangeError('Number of texture layers must be >= 0.');
        }
        if (colors < 0) {
            throw new RangeError('Number of colors must be >= 0.');
        }
        if (attributes < 0) {
            throw new RangeError('Number of attributes must be >= 0.');
        }
    }

    build(context: Context3d): VertexArray {
        const groups = this.groups.map(it => it.build());
        return new VertexArray(context, this.points, groups);
    }

    group(mode: VertexArrayMode): VertexArrayGroupBuilder {
        const group = new VertexArrayGroupBuilderImpl(mode, this.points, this.textureLayers, this.colors, this.attributes);
        this.groups.push(group);
        return group;
    }
}