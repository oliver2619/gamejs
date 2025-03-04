import { Object2d } from "./object-2d";
import { Solid2d } from "./solid-2d";

export interface NamedObjectMapData {
    root: Object2d;
    objectsByName?: { [key: string]: Object2d };
    solidsByName?: { [key: string]: Solid2d };
}

export class NamedObjectMap {

    readonly root: Object2d;

    private readonly objectsByName = new Map<string, Object2d>();
    private readonly solidsByName = new Map<string, Solid2d>();

    constructor(data: NamedObjectMapData) {
        this.root = data.root;
        if (data.objectsByName != undefined) {
            Object.entries(data.objectsByName).forEach(it => this.objectsByName.set(it[0], it[1]));
        }
        if (data.solidsByName != undefined) {
            Object.entries(data.solidsByName).forEach(it => this.solidsByName.set(it[0], it[1]));
        }
    }

    getObject(name: string): Object2d | undefined {
        return this.objectsByName.get(name);
    }

    getSolid(name: string): Solid2d | undefined {
        return this.solidsByName.get(name);
    }
}