import { ImageCache, Rectangle, ResourceLoader, Vector2d } from "@pluto/core";
import { Object2d } from "../scene/object/object-2d";
import { ImageSolid2dJson, Object2dJson, Object2dPartJson, Object2dWithMaterialJson, ObjectLayerJson, ObjectLayerWithMaterialJson, PathSolid2dJson, TextSolid2dJson } from "./object-2d-json";
import { Material2dCache, Material2dLoader } from "../material";
import { ImageSolid2d, Object2dPart, Object2dPartContainer, ObjectLayer, PathSolid2d, TextSolid2d } from "../scene";
import { TextHAlign, TextVAlign } from "../render/text-align";
import { PathLoader } from "../render";

// Order: filter, jsonMapper, consumer
export interface Object2dLoaderData {
    baseUrl?: string;
    consumer?: (json: Readonly<Object2dPartJson>, part: Object2dPart) => void;
    filter?: (json: Readonly<Object2dPartJson>) => boolean;
    jsonMapper?: (json: Readonly<Object2dPartJson>) => Object2dPartJson;
}

export class Object2dLoader {

    private readonly baseUrl: string | undefined;
    private readonly consumer: (json: Readonly<Object2dPartJson>, part: Object2dPart) => void;
    private readonly filter: (json: Readonly<Object2dPartJson>) => boolean;
    private readonly jsonMapper: (json: Readonly<Object2dPartJson>) => Object2dPartJson;

    constructor(data?: Readonly<Object2dLoaderData>) {
        this.baseUrl = data?.baseUrl;
        this.consumer = data?.consumer ?? (() => undefined);
        this.filter = data?.filter ?? (() => true);
        this.jsonMapper = data?.jsonMapper ?? ((json) => json);
    }

    loadObject(url: string): Promise<Object2d> {
        return new ResourceLoader(this.baseUrl).loadJson<Object2dWithMaterialJson>(url).then(it => this.loadObjectFromJson(it));
    }

    loadObjectFromJson(json: Object2dWithMaterialJson): Promise<Object2d> {
        const materialCache = new Material2dCache(Material2dCache.GLOBAL);
        new Material2dLoader().loadFromJson(json.materials, materialCache);
        return this.parseObject(json.root, materialCache);
    }

    loadObjectLayer(url: string): Promise<ObjectLayer> {
        return new ResourceLoader(this.baseUrl).loadJson<ObjectLayerWithMaterialJson>(url).then(it => this.loadObjectLayerFromJson(it));
    }

    loadObjectLayerFromJson(json: ObjectLayerWithMaterialJson): Promise<ObjectLayer> {
        const materialCache = new Material2dCache(Material2dCache.GLOBAL);
        new Material2dLoader().loadFromJson(json.materials, materialCache);
        return this.parseObjectLayer(json.layer, materialCache);
    }

    private parseObjectLayer(json: ObjectLayerJson, materialCache: Material2dCache): Promise<ObjectLayer> {
        const materialPromise = json.material == undefined ? Promise.resolve(undefined) : materialCache.getMaterial(json.material);
        return materialPromise.then(material => new ObjectLayer({
            alpha: json.alpha,
            filter: json.filter,
            localCameraScale: json.scale,
            material,
            visible: json.visible,
        })).then(layer => {
            if (json.parts == undefined) {
                return layer;
            } else {
                return this.parseObjectParts(layer, json.parts, materialCache).then(() => layer);
            }
        });
    }

    private rotationToXAxis(rotation: number | undefined): Vector2d | undefined {
        if (rotation == undefined) {
            return undefined;
        }
        const cos = Math.cos(rotation * Math.PI * 2);
        const sin = Math.sin(rotation * Math.PI * 2);
        return new Vector2d(cos, sin);
    }

    private parseObject(json: Object2dJson, materialCache: Material2dCache): Promise<Object2d> {
        const xAxis = this.rotationToXAxis(json.coords?.rotation);
        const materialPromise = json.material == undefined ? Promise.resolve(undefined) : materialCache.getMaterial(json.material);
        return materialPromise.then(material => new Object2d({
            alpha: json.alpha,
            blendOperation: json.blend,
            material,
            name: json.name,
            position: json.coords?.position == undefined ? undefined : new Vector2d(json.coords.position[0], json.coords.position[1]),
            visible: json.visible,
            xAxis,
            yAxis: xAxis?.getCrossProductWithScalar(-1),
        })).then(obj => {
            if (json.parts == undefined) {
                return obj;
            } else {
                return this.parseObjectParts(obj, json.parts, materialCache).then(() => obj);
            }
        });
    }

    private parseObjectParts(obj: Object2dPartContainer, json: Object2dPartJson[], materialCache: Material2dCache): Promise<void> {
        const allPromises = json
            .filter(partJson => this.filter(partJson))
            .map(partJson => this.jsonMapper(partJson))
            .map(partJson => this.parseObjectPart(partJson, materialCache).then(it => {
                this.consumer(partJson, it);
                obj.addPart(it);
            }));
        return Promise.all(allPromises).then(() => undefined);
    }

    private parseObjectPart(json: Object2dPartJson, materialCache: Material2dCache): Promise<Object2dPart> {
        switch (json.type) {
            case 'image':
                return this.parseImageSolid(json as ImageSolid2dJson);
            case 'object':
                return this.parseObject(json as Object2dJson, materialCache);
            case 'path':
                return this.parsePathSolid(json as PathSolid2dJson, materialCache);
            case 'text':
                return this.parseTextSolid(json as TextSolid2dJson, materialCache);
            default:
                throw new RangeError(`Object type ${json.type} not supported.`);
        }
    }

    private parseImageSolid(json: ImageSolid2dJson): Promise<ImageSolid2d> {
        return ImageCache.get(json.image).then(image => {
            return new ImageSolid2d({
                image,
                alpha: json.alpha,
                blendOperation: json.blend,
                clipPath: json.clip == undefined ? undefined : PathLoader.load(json.clip),
                filter: json.filter,
                index: json.index,
                name: json.name,
                position: new Vector2d(json.position[0], json.position[1]),
                scale: json.scale,
                visible: json.visible,
            });
        });
    }

    private parsePathSolid(json: PathSolid2dJson, materialCache: Material2dCache): Promise<PathSolid2d> {
        const materialPromise = json.material == undefined ? Promise.resolve(undefined) : materialCache.getMaterial(json.material);
        return materialPromise.then(material => {
            return new PathSolid2d({
                path: PathLoader.load(json.path),
                alpha: json.alpha,
                blendOperation: json.blend,
                clipPath: json.clip == undefined ? undefined : PathLoader.load(json.clip),
                fill: json.fill,
                filter: json.filter,
                material,
                name: json.name,
                stroke: json.stroke,
                visible: json.visible
            });
        });
    }

    private parseTextSolid(json: TextSolid2dJson, materialCache: Material2dCache): Promise<TextSolid2d> {
        const materialPromise = json.material == undefined ? Promise.resolve(undefined) : materialCache.getMaterial(json.material);
        return materialPromise.then(material => new TextSolid2d({
            rectangle: new Rectangle(json.rect[0], json.rect[1], json.rect[2], json.rect[3]),
            text: json.text,
            alpha: json.alpha,
            blendOperation: json.blend,
            clipPath: json.clip == undefined ? undefined : PathLoader.load(json.clip),
            fill: json.fill,
            filter: json.filter,
            hAlign: json.hAlign == undefined ? undefined : TextHAlign[json.hAlign],
            material,
            name: json.name,
            stroke: json.stroke,
            vAlign: json.vAlign == undefined ? undefined : TextVAlign[json.vAlign],
            visible: json.visible
        }));
    }
}
