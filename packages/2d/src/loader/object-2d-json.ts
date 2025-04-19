import { Material2dCacheJson } from "../material/material-2d-json";
import { Blend2dOperation, Filter, PathJson } from "../render";
import { TextHAlign, TextVAlign } from "../render/text-align";

export type Object2dPartTypeJson = 'object' | 'image' | 'path' | 'text';
export type Vector2dJson = [number, number];

export interface CoordSystem2dJson {
    position?: Vector2dJson;
    rotation?: number;
}

export interface Object2dPartJson {
    type: Object2dPartTypeJson;
    alpha?: number;
    blend?: Blend2dOperation;
    data?: any;
    name?: string;
    visible?: boolean;
}

export interface ImageSolid2dJson extends Object2dPartJson {
    type: 'image';
    image: string;
    position: Vector2dJson;
    clip?: PathJson[];
    filter?: Filter;
    index?: number;
    scale?: number;
}

export interface PathSolid2dJson extends Object2dPartJson {
    type: 'path';
    path: PathJson[];
    clip?: PathJson[];
    fill?: CanvasFillRule;
    filter?: Filter;
    material?: string;
    stroke?: boolean;
}

export interface TextSolid2dJson extends Object2dPartJson {
    type: 'text';
    text: string;
    rect: [number, number, number, number];
    clip?: PathJson[];
    fill?: boolean;
    filter?: Filter;
    material?: string;
    hAlign?: keyof typeof TextHAlign;
    stroke?: boolean;
    vAlign?: keyof typeof TextVAlign;
}

export interface Object2dJson extends Object2dPartJson {
    type: 'object';
    coords?: CoordSystem2dJson;
    material?: string;
    parts?: Object2dPartJson[];
}

export interface Object2dWithMaterialJson {
    readonly version: 1;
    materials: Material2dCacheJson;
    root: Object2dJson;
}

export interface ObjectLayerJson {
    alpha?: number;
    filter?: Filter;
    material?: string;
    parts?: Object2dPartJson[];
    scale?: number;
    visible?: boolean;
}

export interface ObjectLayerWithMaterialJson {
    readonly version: 1;
    materials: Material2dCacheJson;
    layer: ObjectLayerJson;
}