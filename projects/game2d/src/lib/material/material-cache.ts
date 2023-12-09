import { ImageCache } from "projects/core/src/public-api";

export class MaterialCache {

    constructor(readonly imageCache: ImageCache) {
    }

    wait(): Promise<number> {
        return this.imageCache.wait();
    }
}