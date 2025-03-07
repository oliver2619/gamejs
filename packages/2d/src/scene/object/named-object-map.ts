import { ImageSolid2d } from "./image-solid-2d";
import { Object2d } from "./object-2d";
import { Solid2d } from "./solid-2d";

export class NamedObjectMap {

    private readonly objectsByName = new Map<string, Object2d>();
    private readonly imagesByName = new Map<string, ImageSolid2d>();
    private readonly solidsByName = new Map<string, Solid2d>();

    constructor(readonly root: Object2d) {
        this.initDictionaries(root);
    }

    clone(): NamedObjectMap {
        return new NamedObjectMap(this.root.clone());
    }

    getImage(name: string): ImageSolid2d | undefined {
        return this.imagesByName.get(name);
    }

    getObject(name: string): Object2d | undefined {
        return this.objectsByName.get(name);
    }

    getSolid(name: string): Solid2d | undefined {
        return this.solidsByName.get(name);
    }

    updateMap() {
        this.imagesByName.clear();
        this.objectsByName.clear();
        this.solidsByName.clear();
        this.initDictionaries(this.root);
    }

    private initDictionaries(object: Object2d) {
        object.parts.forEach(part => {
            if (part.name != undefined) {
                if (part instanceof Object2d) {
                    this.objectsByName.set(part.name, part);
                    this.initDictionaries(part);
                } else if (part instanceof ImageSolid2d) {
                    this.imagesByName.set(part.name, part);
                } else if (part instanceof Solid2d) {
                    this.solidsByName.set(part.name, part);
                }
            }
        });
    }
}