import { PromisesProgress } from "../promises-progress";
import { ImageResource } from "./image-resource";
import { ImageFilters } from "./image-filters";

export type ImageCacheAlphaOperation = 'keepAlpha' | 'keepNoAlpha' | 'auto' | 'removeAlpha';

class Item {

    readonly promise: Promise<ImageResource>;

    constructor(url: string, alpha: ImageCacheAlphaOperation, multiImageSize: number, progress: PromisesProgress, onDispose: () => void) {
        let resolveCallback: (value: ImageResource) => void;
        let rejectCallback: (reason: Error) => void;
        const promise = new Promise<ImageResource>((resolve, reject) => {
            resolveCallback = resolve;
            rejectCallback = reject;
        });
        this.promise = progress.add(promise);
        const image = new Image();
        image.src = url;
        image.addEventListener('load', () => {
            switch (alpha) {
                case 'auto':
                    resolveCallback(new ImageResource(image, ImageFilters.isTransparent(image), multiImageSize, onDispose));
                    break;
                case 'keepAlpha':
                    resolveCallback(new ImageResource(image, true, multiImageSize, onDispose));
                    break;
                case 'keepNoAlpha':
                    resolveCallback(new ImageResource(image, false, multiImageSize, onDispose));
                    break;
                case 'removeAlpha':
                    resolveCallback(new ImageResource(ImageFilters.toImage(ImageFilters.removeAlphaFromImage(image), false), false, multiImageSize, onDispose));
            }
        });
        image.addEventListener('error', () => rejectCallback(new Error(`Failed to load image ${url}`)));
    }

}

interface ImageDefinition {
    readonly url: string;
    readonly alpha: ImageCacheAlphaOperation;
    readonly multiImageSize: number;
}

export class ImageCache {

    private readonly items = new Map<string, Item>();
    private readonly definitions = new Map<string, ImageDefinition>();
    private readonly baseUrl: string;
    private readonly progress: PromisesProgress;

    constructor(data?: {
        baseUrl?: string;
        progress?: PromisesProgress;
    }) {
        this.baseUrl = data == undefined || data.baseUrl == undefined ? '' : data.baseUrl;
        this.progress = data == undefined || data.progress == undefined ? new PromisesProgress() : data.progress;
    }

    define(name: string, data: { url: string, alpha?: ImageCacheAlphaOperation, multiImageSize?: number }) {
        const def: ImageDefinition = {
            url: `${this.baseUrl}/${data.url}`,
            alpha: data.alpha == undefined ? 'auto' : data.alpha,
            multiImageSize: data.multiImageSize == undefined ? 1 : data.multiImageSize
        }
        this.definitions.set(name, def);
    }

    get(name: string): Promise<ImageResource> {
        const def = this.definitions.get(name);
        if (def == undefined) {
            throw new RangeError(`No URL defined for image ${name}`);
        }
        const ret = this.items.get(name);
        if (ret == undefined) {
            const newItem = new Item(def.url, def.alpha, def.multiImageSize, this.progress, () => {
                this.items.delete(name);
            });
            this.items.set(name, newItem);
            return newItem.promise;
        } else {
            return ret.promise;
        }
    }

    getAll(...names: string[]): Promise<{ [key: string]: ImageResource }> {
        const promises = names.map(it => this.get(it));
        return Promise.all(promises).then(values => {
            const ret: { [key: string]: ImageResource } = {};
            names.forEach((name, ix) => ret[name] = values[ix]);
            return ret;
        });
    }

    wait(): Promise<number> {
        return this.progress.wait();
    }
}