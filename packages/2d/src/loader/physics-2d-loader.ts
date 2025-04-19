import { ResourceLoader, Vector2d } from "@pluto/core";
import { DynamicBody, DynamicBox, DynamicCircle, PhysicsMaterial, PhysicsSystem2d, StaticBody2d, StaticCircle2d, StaticBorder2d, StaticLine2d, StaticPoint2d, StaticPolygon2d } from "../physics";
import { PhysicsSystem2dJson, StaticBody2dJson, Body2dMaterialJson, StaticBorder2dJson, StaticCircle2dJson, StaticLines2dJson, StaticPoints2dJson, StaticPolygon2dJson, DynamicBody2dJson, DynamicBox2dJson, DynamicCircle2dJson } from "./physics-system-2d-json";
import { Object2d } from "../scene";

export interface Physics2dLoaderData {
    baseUrl?: string;
    dynamicBodyMapper?: (json: Readonly<DynamicBody2dJson>) => Object2d;
    dynamicBodyConsumer?: (json: Readonly<DynamicBody2dJson>, body: DynamicBody) => void;
    staticBodyConsumer?: (json: Readonly<StaticBody2dJson>, body: StaticBody2d) => void;
}

export class Physics2dLoader {

    private readonly baseUrl: string | undefined;
    private readonly dynamicBodyMapper: ((json: Readonly<DynamicBody2dJson>) => Object2d) | undefined;
    private readonly dynamicBodyConsumer: (json: Readonly<DynamicBody2dJson>, body: DynamicBody) => void;
    private readonly staticBodyConsumer: (json: Readonly<StaticBody2dJson>, body: StaticBody2d) => void;

    constructor(data: Readonly<Physics2dLoaderData>) {
        this.baseUrl = data.baseUrl;
        this.dynamicBodyMapper = data.dynamicBodyMapper;
        this.dynamicBodyConsumer = data.dynamicBodyConsumer ?? (() => undefined);
        this.staticBodyConsumer = data.staticBodyConsumer ?? (() => undefined);
    }

    loadSystem(url: string): Promise<PhysicsSystem2d> {
        return new ResourceLoader(this.baseUrl).loadJson<PhysicsSystem2dJson>(url).then(json => this.loadSystemFromJson(json));
    }

    loadSystemFromJson(json: PhysicsSystem2dJson): PhysicsSystem2d {
        const system = new PhysicsSystem2d({
            globalAcceleration: json.gravity == undefined ? undefined : new Vector2d(json.gravity[0], json.gravity[1])
        });
        const materials = this.loadMaterials(json);
        json.static?.forEach(it => this.loadStaticBody(it, system, materials));
        if (json.dynamic != undefined && json.dynamic.length > 0 && this.dynamicBodyMapper == undefined) {
            throw new Error('Unable to load dynamic bodies without a dynamic body mapper.');
        }
        json.dynamic?.forEach(it => this.loadDynamicBody(it, system, materials));
        return system;
    }

    private loadMaterial(json: Body2dMaterialJson): PhysicsMaterial {
        return new PhysicsMaterial({ bounciness: json.bounciness, friction: json.friction });
    }

    private loadMaterials(json: PhysicsSystem2dJson): Map<string, PhysicsMaterial> {
        const materials = new Map<string, PhysicsMaterial>();
        if (json.materials != undefined) {
            Object.entries(json.materials).forEach(it => materials.set(it[0], this.loadMaterial(it[1])));
        }
        return materials;
    }

    private loadDynamicBody(json: DynamicBody2dJson, system: PhysicsSystem2d, materials: Map<string, PhysicsMaterial>) {
        switch (json.type) {
            case 'box':
                this.loadDynamicBox(json as DynamicBox2dJson, system, materials);
                break;
            case 'circle':
                this.loadDynamicCircle(json as DynamicCircle2dJson, system, materials);
                break;
            default:
                throw new RangeError(`Unknown dynamic body type ${json.type}.`);
        }
    }

    private loadDynamicBox(json: DynamicBox2dJson, system: PhysicsSystem2d, materials: Map<string, PhysicsMaterial>) {
        const material = json.material == undefined ? undefined : materials.get(json.material);
        const body = new DynamicBox({
            height: json.height,
            width: json.width,
            object: this.dynamicBodyMapper!(json),
            enabled: json.enabled,
            gravity: json.gravity,
            mass: json.mass,
            material,
            z: json.z,
            zDepth: json.depth,
        });
        system.addDynamicBody(body);
        this.dynamicBodyConsumer(json, body);
    }

    private loadDynamicCircle(json: DynamicCircle2dJson, system: PhysicsSystem2d, materials: Map<string, PhysicsMaterial>) {
        const material = json.material == undefined ? undefined : materials.get(json.material);
        const body = new DynamicCircle({
            radius: json.radius,
            relativeMomentOfInertia: json.inertia,
            object: this.dynamicBodyMapper!(json),
            enabled: json.enabled,
            gravity: json.gravity,
            mass: json.mass,
            material,
            z: json.z,
            zDepth: json.depth,
        });
        system.addDynamicBody(body);
        this.dynamicBodyConsumer(json, body);
    }

    private loadStaticBody(json: StaticBody2dJson, system: PhysicsSystem2d, materials: Map<string, PhysicsMaterial>) {
        switch (json.type) {
            case 'border':
                this.loadBorder(json as StaticBorder2dJson, system, materials);
                break;
            case 'circle':
                this.loadCircle(json as StaticCircle2dJson, system, materials);
                break;
            case 'lines':
                this.loadLines(json as StaticLines2dJson, system, materials);
                break;
            case 'points':
                this.loadPoints(json as StaticPoints2dJson, system, materials);
                break;
            case 'polygon':
                this.loadPolygon(json as StaticPolygon2dJson, system, materials);
                break;
            default:
                throw new RangeError(`Unknown static body type ${json.type}.`);
        }
    }

    private loadBorder(json: StaticBorder2dJson, system: PhysicsSystem2d, materials: Map<string, PhysicsMaterial>) {
        const material = json.material == undefined ? undefined : materials.get(json.material);
        const body = new StaticBorder2d({
            normal: new Vector2d(json.direction[1], -json.direction[0]),
            point: new Vector2d(json.point[0], json.point[1]),
            enabled: json.enabled,
            material,
            z: json.z,
            zDepth: json.depth,
        });
        system.addBorder(body);
        this.staticBodyConsumer(json, body);
    }

    private loadCircle(json: StaticCircle2dJson, system: PhysicsSystem2d, materials: Map<string, PhysicsMaterial>) {
        const material = json.material == undefined ? undefined : materials.get(json.material);
        if (json.r == undefined) {
            const body = new StaticPoint2d({
                position: new Vector2d(json.x, json.y),
                enabled: json.enabled,
                material,
                z: json.z,
                zDepth: json.depth,
            });
            system.addStaticBody(body);
            this.staticBodyConsumer(json, body);
        } else {
            const body = new StaticCircle2d({
                center: new Vector2d(json.x, json.y),
                radius: json.r,
                enabled: json.enabled,
                material,
                z: json.z,
                zDepth: json.depth,
            });
            system.addStaticBody(body);
            this.staticBodyConsumer(json, body);
        }
    }

    private loadLines(json: StaticLines2dJson, system: PhysicsSystem2d, materials: Map<string, PhysicsMaterial>) {
        const material = json.material == undefined ? undefined : materials.get(json.material);
        json.lines.forEach(line => {
            const body = new StaticLine2d({
                p1: new Vector2d(line[0], line[1]),
                p2: new Vector2d(line[2], line[3]),
                enabled: json.enabled,
                material,
                z: json.z,
                zDepth: json.depth,
            });
            system.addStaticBody(body);
            this.staticBodyConsumer(json, body);
        });
    }

    private loadPoints(json: StaticPoints2dJson, system: PhysicsSystem2d, materials: Map<string, PhysicsMaterial>) {
        const material = json.material == undefined ? undefined : materials.get(json.material);
        json.points.forEach(point => {
            const body = new StaticPoint2d({
                position: new Vector2d(point[0], point[1]),
                enabled: json.enabled,
                material,
                z: json.z,
                zDepth: json.depth,
            });
            system.addStaticBody(body);
            this.staticBodyConsumer(json, body);
        });
    }

    private loadPolygon(json: StaticPolygon2dJson, system: PhysicsSystem2d, materials: Map<string, PhysicsMaterial>) {
        const material = json.material == undefined ? undefined : materials.get(json.material);
        const body = new StaticPolygon2d({
            points: json.points.map(p => new Vector2d(p[0], p[1])),
            enabled: json.enabled,
            material,
            z: json.z,
            zDepth: json.depth,
        });
        system.addStaticBody(body);
        this.staticBodyConsumer(json, body);
    }

}