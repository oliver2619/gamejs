import { ResourceLoader } from "../resource";
import { ImageFilters } from "./image-filters";
import { ImageObject } from "./image-object";
import { ImageResource } from "./image-resource";

export enum ImageCacheAlphaOperation {
    KEEP_TRANSPARENT, REMOVE_TRANSPARENCY, KEEP_OPAQUE, AUTO_DETECT
}
class ImageCacheElement {

    private result: Promise<ImageResource> | undefined;

    constructor(private readonly url: string, private alpha: ImageCacheAlphaOperation, private multiImageSize: number, private readonly onDeleteCallback?: () => void) { }

    get(): Promise<ImageResource> {
        if (this.result == undefined) {
            this.result = new ResourceLoader().loadImage(this.url).then(img => {
                const imgRes = new ImageResource(this.createImageObject(img), this.multiImageSize);
                imgRes.onPostDelete.subscribeOnce(() => this.onDelete());
                return imgRes;
            }).catch(reason => {
                if (this.onDeleteCallback != undefined) {
                    this.onDeleteCallback();
                }
                throw reason();
            });
        }
        return this.result;
    }

    private createImageObject(img: HTMLImageElement): ImageObject {
        switch (this.alpha) {
            case ImageCacheAlphaOperation.AUTO_DETECT:
                return new ImageObject(img, undefined);
            case ImageCacheAlphaOperation.KEEP_OPAQUE:
                return new ImageObject(img, false);
            case ImageCacheAlphaOperation.KEEP_TRANSPARENT:
                return new ImageObject(img, true);
            case ImageCacheAlphaOperation.REMOVE_TRANSPARENCY:
                return ImageFilters.removeAlpha()(new ImageObject(img, true));
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
        ImageCache.register(id, URL.parse(url, this.baseUrl)!.href);
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

    static getByUrl(url: string, alpha?: ImageCacheAlphaOperation, multiImageSize?: number): Promise<ImageResource> {
        const el = this.imagesByUrl.get(url);
        if (el == undefined) {
            const newEl = new ImageCacheElement(url, alpha ?? ImageCacheAlphaOperation.AUTO_DETECT, multiImageSize ?? 1, () => this.imagesByUrl.delete(url));
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

    static register(id: string, url: string, alpha?: ImageCacheAlphaOperation, multiImageSize?: number) {
        if (this.imagesById.has(id)) {
            throw new RangeError(`Image resource with id ${id} already registered.`);
        }
        this.imagesById.set(id, new ImageCacheElement(url, alpha ?? ImageCacheAlphaOperation.AUTO_DETECT, multiImageSize ?? 1));
    }
}
