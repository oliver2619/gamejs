import { Object2dLoader } from "./object-2d-loader";
import { Object2dResource } from "./object-2d-resource";

export interface Object2dCacheData {
    baseUrl?: string;
}

class Object2dElement {
    readonly promise: Promise<Object2dResource>;

    constructor(url: string, onDelete: () => void) {
        this.promise = new Object2dLoader().loadObject(url).then(it => {
            const ret = new Object2dResource(it);
            ret.onPostDelete.subscribeOnce(onDelete);
            return ret;
        }).catch(err => {
            onDelete();
            throw err;
        });
    }
}

export class Object2dCache {

    private readonly baseUrl: string;
    private readonly urlsByName = new Map<string, string>();
    private readonly objectsByName = new Map<string, Object2dElement>();

    constructor(data: Object2dCacheData) {
        this.baseUrl = data.baseUrl ?? document.baseURI;
    }

    get(name: string): Promise<Object2dResource> {
        const ret = this.objectsByName.get(name);
        if (ret == undefined) {
            const def = this.urlsByName.get(name);
            if (def == undefined) {
                throw new RangeError(`Object ${name} not defined.`);
            }
            const newObj = new Object2dElement(def, () => this.objectsByName.delete(name));
            this.objectsByName.set(name, newObj);
            return newObj.promise;
        } else {
            return ret.promise;
        }
    }

    register(name: string, data: { url: string }) {
        const url = URL.parse(data.url, this.baseUrl);
        if (url == null) {
            throw new RangeError(`Illegal URL ${this.baseUrl}${data.url}.`);
        }
        this.urlsByName.set(name, url.href);
    }
}