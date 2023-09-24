import { PromisesProgress } from "../promises-progress";
import { ImageResource } from "./image-resource";

class Item {

    readonly promise: Promise<ImageResource>;

    constructor(url: string, progress: PromisesProgress, onDispose: () => void) {
        let resolveCallback: (value: ImageResource) => void;
        let rejectCallback: (reason: Error) => void;
        const promise = new Promise<ImageResource>((resolve, reject) => {
            resolveCallback = resolve;
            rejectCallback = reject;
        });
        this.promise = progress.add(promise);
        const image = new Image();
        image.src = url;
        image.addEventListener('load', () => resolveCallback(new ImageResource(image, onDispose)));
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

    get(url: string): Promise<ImageResource> {
        const finalUrl = `${this.baseUrl}/${url}`;
        const ret = this.items.get(finalUrl);
        if (ret == undefined) {
            const newItem = new Item(finalUrl, this.progress, () => {
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