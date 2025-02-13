import { ImageResource } from "./image-resource";

class ImageResourceElement {

    private result: Promise<ImageResource> | undefined;

    constructor(private readonly url: string) { }

    get(): Promise<ImageResource> {
        if (this.result == undefined) {
            let resolve: (result: ImageResource) => void;
            let reject: (reason: any) => void;
            this.result = new Promise<ImageResource>((r1, r2) => {
                resolve = r1;
                reject = r2;
            });
            const img = document.createElement('img');
            img.onload = () => resolve(new ImageResource(img, () => this.onDestroy()));
            img.onerror = (_1: Event | string, _2?: string, _3?: number, _4?: number, error?: Error) => {
                if (error == undefined) {
                    reject(`Failed to load image ${this.url}.`);
                } else {
                    reject(`Failed to load image ${this.url}. ${error.name}: ${error.message}`);
                }
            };
            img.src = this.url;
            return this.result;
        } else {
            return this.result;
        }
    }

    private onDestroy() {
        this.result = undefined;
    }
}

export class ImageResourcesBuilder {

    private baseUrl: string = '/';

    register(id: string, url: string): ImageResourcesBuilder {
        ImageResources.register(id, URL.parse(url, this.baseUrl)!!.href);
        return this;
    }

    registerAll(ids: string[], fileExtension: string): ImageResourcesBuilder {
        ids.forEach(it => this.register(it, `${it}${fileExtension}`));
        return this;
    }

    withBaseUrl(baseUrl: string): ImageResourcesBuilder {
        this.baseUrl = baseUrl;
        return this;
    }
}

export class ImageResources {

    private static readonly imagesById = new Map<string, ImageResourceElement>();

    private constructor() { }

    static get(id: string): Promise<ImageResource> {
        const el = this.imagesById.get(id);
        if (el == undefined) {
            throw new RangeError(`Image resource with id ${id} not found.`);
        }
        return el.get();
    }

    static register(id: string, url: string) {
        if (this.imagesById.has(id)) {
            throw new RangeError(`Image resource with id ${id} already registered.`);
        }
        this.imagesById.set(id, new ImageResourceElement(url));
    }
}