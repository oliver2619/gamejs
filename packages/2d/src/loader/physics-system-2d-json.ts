export type StaticBody2dTypeJson = 'border' | 'circle' | 'lines' | 'points' | 'polygon';
export type DynamicBody2dTypeJson = 'box' | 'circle';

export interface Body2dMaterialJson {
    friction: number;
    bounciness: number;
}

export interface DynamicBody2dJson {
    type: DynamicBody2dTypeJson;
    data?: any;
    depth: number;
    enabled?: boolean;
    gravity?: number;
    mass?: number;
    material?: string;
    name?: string;
    rotation?: number;
    x: number;
    y: number;
    z: number;
}

export interface DynamicBox2dJson extends DynamicBody2dJson {
    type: 'box';
    width: number;
    height: number;
}

// inertia: relative value 0..1 gets multiplied with m * r * r.
export interface DynamicCircle2dJson extends DynamicBody2dJson {
    type: 'circle';
    radius: number;
    inertia: number;
}

export interface StaticBody2dJson {
    type: StaticBody2dTypeJson;
    data?: any;
    depth: number;
    enabled?: boolean;
    material?: string;
    name?: string;
    z: number;
}

export interface StaticBorder2dJson extends StaticBody2dJson {
    type: 'border';
    point: [number, number];
    direction: [number, number];
}

export interface StaticCircle2dJson extends StaticBody2dJson {
    type: 'circle';
    x: number;
    y: number;
    r?: number;
}

export interface StaticLines2dJson extends StaticBody2dJson {
    type: 'lines';
    lines: Array<[number, number, number, number]>;
}

export interface StaticPoints2dJson extends StaticBody2dJson{
    type: 'points';
    points: Array<[number, number]>;
}

export interface StaticPolygon2dJson extends StaticBody2dJson {
    type: 'polygon';
    points: Array<[number, number]>;
}

export interface PhysicsSystem2dJson {
    readonly version: 1;
    gravity?: [number, number];
    materials?: {[key: string]: Body2dMaterialJson};
    static?: StaticBody2dJson[];
    dynamic?: DynamicBody2dJson[];
}