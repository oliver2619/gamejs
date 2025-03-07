import { PromisesProgress } from "../resource";
import { ImageObject } from "./image-object";
import { ImageResource } from "./image-resource";

class ImageCacheElement {

    private result: Promise<ImageResource> | undefined;

    constructor(private readonly url: string, private alpha: boolean | undefined, private multiImageSize: number, private readonly onDeleteCallback?: () => void) { }

    get(): Promise<ImageResource> {
        if (this.result == undefined) {
            let resolve: (result: ImageResource) => void;
            let reject: (reason: any) => void;
            this.result = new Promise<ImageResource>((r1, r2) => {
                resolve = r1;
                reject = r2;
            });
            const img = document.createElement('img');
            img.onload = () => {
                const imgRes = new ImageResource(new ImageObject(img, this.alpha), this.multiImageSize);
                imgRes.onPostDelete.subscribeOnce(() => this.onDelete());
                resolve(imgRes);
            };
            img.onerror = (_1: Event | string, _2?: string, _3?: number, _4?: number, error?: Error) => {
                if (error == undefined) {
                    reject(`Failed to load image ${this.url}.`);
                } else {
                    reject(`Failed to load image ${this.url}. ${error.name}: ${error.message}`);
                }
                if (this.onDeleteCallback != undefined) {
                    this.onDeleteCallback();
                }
            };
            img.src = this.url;
            return PromisesProgress.add(this.result);
        } else {
            return this.result;
        }
    }

    private onDelete() {
        this.result = undefined;
        if (this.onDeleteCallback != undefined) {
            this.onDeleteCallback();
        }
    }
}

export class ImageCacheBuilder {

    private baseUrl: string = '/';

    register(id: string, url: string): ImageCacheBuilder {
        ImageCache.register(id, URL.parse(url, this.baseUrl)!!.href);
        return this;
    }

    registerAll(ids: string[], fileExtension: string): ImageCacheBuilder {
        ids.forEach(it => this.register(it, `${it}${fileExtension}`));
        return this;
    }

    withBaseUrl(baseUrl: string): ImageCacheBuilder {
        this.baseUrl = baseUrl;
        return this;
    }
}

export class ImageCache {

    private static readonly imagesById = new Map<string, ImageCacheElement>();
    private static readonly imagesByUrl = new Map<string, ImageCacheElement>();

    private constructor() { }

    static get(id: string): Promise<ImageResource> {
        const el = this.imagesById.get(id);
        if (el == undefined) {
            throw new RangeError(`Image resource with id ${id} not found.`);
        }
        return el.get();
    }

    static getByUrl(url: string, alpha?: boolean, multiImageSize?: number): Promise<ImageResource> {
        const el = this.imagesByUrl.get(url);
        if (el == undefined) {
            const newEl = new ImageCacheElement(url, alpha, multiImageSize ?? 1, () => this.imagesByUrl.delete(url));
            this.imagesByUrl.set(url, newEl);
            return newEl.get();
        } else {
            return el.get();
        }
    }

    static getAll<T>(...idList: Array<keyof T>): Promise<{ [P in keyof T]: ImageResource }> {
        const promises = idList.map(it => this.get(it as string));
        return Promise.all(promises).then(it => {
            const ret: { [P in keyof T]: ImageResource } = {} as { [P in keyof T]: ImageResource };
            idList.forEach((name, ix) => ret[name] = it[ix]!);
            return ret;
        });
    }

    static register(id: string, url: string, alpha?: boolean, multiImageSize?: number) {
        if (this.imagesById.has(id)) {
            throw new RangeError(`Image resource with id ${id} already registered.`);
        }
        this.imagesById.set(id, new ImageCacheElement(url, alpha, multiImageSize ?? 1));
    }
}
