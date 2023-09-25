import {PromisesProgress} from "../promises-progress";
import {ImageResource} from "./image-resource";
import {ImageFilters} from "./image-filters";

export type ImageCacheAlphaOperation = 'keepAlpha' | 'keepNoAlpha' | 'auto' | 'removeAlpha';

class Item {

    readonly promise: Promise<ImageResource>;

    constructor(url: string, alpha: ImageCacheAlphaOperation, progress: PromisesProgress, onDispose: () => void) {
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
                    resolveCallback(new ImageResource(image, ImageFilters.isTransparent(image), onDispose));
                    break;
                case 'keepAlpha':
                    resolveCallback(new ImageResource(image, true, onDispose));
                    break;
                case 'keepNoAlpha':
                    resolveCallback(new ImageResource(image, false, onDispose));
                    break;
                case 'removeAlpha':
                    resolveCallback(new ImageResource(ImageFilters.toImage(ImageFilters.removeAlphaFromImage(image), false), false, onDispose));
            }
        });
        image.addEventListener('error', () => rejectCallback(new Error(`Failed to load image ${url}`)));
    }

}

export class ImageCache {

    private readonly items = new Map<string, Item>();
    private readonly baseUrl: string;
    private readonly progress: PromisesProgress;

    constructor(data?: {
        baseUrl?: string;
        progress?: PromisesProgress;
    }) {
        this.baseUrl = data == undefined || data.baseUrl == undefined ? '' : data.baseUrl;
        this.progress = data == undefined || data.progress == undefined ? new PromisesProgress() : data.progress;
    }

    get(url: string, alpha: ImageCacheAlphaOperation): Promise<ImageResource> {
        const finalUrl = `${this.baseUrl}/${url}`;
        const ret = this.items.get(finalUrl);
        if (ret == undefined) {
            const newItem = new Item(finalUrl, alpha, this.progress, () => {
                this.items.delete(finalUrl);
            });
            this.items.set(finalUrl, newItem);
            return newItem.promise;
        } else {
            return ret.promise;
        }
    }

    wait(): Promise<number> {
        return this.progress.wait();
    }
}