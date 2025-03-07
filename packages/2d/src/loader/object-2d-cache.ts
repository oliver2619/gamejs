import { Object2dLoaderImageMapper, Object2dLoaderPatternMapper } from "./object-2d-loader";
import { Object2dLoaderFactory } from "./object-2d-loader-factory";
import { Object2dResource } from "./object-2d-resource";

export interface Object2dCacheData {
    baseUrl?: string;
    imageMapper: Object2dLoaderImageMapper;
    patternMapper: Object2dLoaderPatternMapper;
}

interface Object2dDefinition {
    url: string;
    readonly imageMapper: Object2dLoaderImageMapper;
    readonly patternMapper: Object2dLoaderPatternMapper;
}

class Object2dElement {
    readonly promise: Promise<Object2dResource>;

    constructor(def: Object2dDefinition, onDelete: () => void) {
        const objectLoaderFactory = new Object2dLoaderFactory({
            imageMapper: def.imageMapper,
            patternMapper: def.patternMapper
        });
        const loader = objectLoaderFactory.getObjectLoader(def.url);
        this.promise = loader.loadObject(def.url).then(it => {
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
    private readonly definitionsByName = new Map<string, Object2dDefinition>();
    private readonly objectsByName = new Map<string, Object2dElement>();
    private readonly imageMapper: Object2dLoaderImageMapper;
    private readonly patternMapper: Object2dLoaderPatternMapper;

    constructor(data: Object2dCacheData) {
        this.baseUrl = data == undefined || data.baseUrl == undefined ? '' : data.baseUrl;
        this.imageMapper = data.imageMapper;
        this.patternMapper = data.patternMapper;
    }

    get(name: string): Promise<Object2dResource> {
        const ret = this.objectsByName.get(name);
        if (ret == undefined) {
            const def = this.definitionsByName.get(name);
            if (def == undefined) {
                throw new RangeError(`Object ${name} not defined`);
            }
            const newObj = new Object2dElement(def, () => this.objectsByName.delete(name));
            this.objectsByName.set(name, newObj);
            return newObj.promise;
        } else {
            return ret.promise;
        }
    }

    register(name: string, data: { url: string, imageMapper?: Object2dLoaderImageMapper, patternMapper?: Object2dLoaderPatternMapper }) {
        const def: Object2dDefinition = {
            // TODO use URL
            url: `${this.baseUrl}/${data.url}`,
            imageMapper: data.imageMapper ?? this.imageMapper,
            patternMapper: data.patternMapper ?? this.patternMapper,
        };
        this.definitionsByName.set(name, def);
    }
}