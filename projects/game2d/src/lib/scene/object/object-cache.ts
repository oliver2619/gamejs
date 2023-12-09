import { MaterialCache } from "../../material";

export class ObjectCache {

    constructor(readonly materialCache: MaterialCache) { }

    wait(): Promise<number> {
        return this.materialCache.wait();
    }
}