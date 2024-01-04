import { ImageCache, ImageResource } from "core";
import { LineStyle } from "./line-style";
import { Material } from "./material";
import { PaintStyle } from "./paint-style";
import { PatternStyle } from "./pattern-style";

class PaintStyleElement {

    readonly promise: Promise<PaintStyle>;

    constructor(definition: PaintStyleDefinition, imageCache: ImageCache, onDispose: () => void) {
        if (definition.factoryCallback != undefined) {
            const paintStyle = definition.factoryCallback();
            paintStyle.onReleaseLastReference.subscribe(onDispose);
            this.promise = Promise.resolve(paintStyle);
        } else if (definition.imageCallback != undefined && definition.image != undefined) {
            this.promise = imageCache.get(definition.image).then(image => {
                const paintStyle = definition.imageCallback!(image);
                paintStyle.onReleaseLastReference.subscribe(onDispose);
                return paintStyle;
            });
        } else {
            throw new RangeError('Neither factory callback nor image callback is set');
        }
    }
}

class MaterialElement {

    readonly promise: Promise<Material>;
    private readonly material: Material;

    constructor(definition: MaterialDefinition, paintStyleResolver: (name: string) => Promise<PaintStyle>, onDispose: () => void) {
        this.material = new Material({
            alpha: definition.alpha,
            line: definition.line,
            onDispose
        });
        const promises: Promise<PaintStyle>[] = [];
        if (definition.fill != undefined) {
            promises.push(paintStyleResolver(definition.fill).then(fill => {
                this.material.fill = fill;
                return fill;
            }));
        }
        if (definition.stroke != undefined) {
            promises.push(paintStyleResolver(definition.stroke).then(stroke => {
                this.material.stroke = stroke;
                return stroke;
            }));
        }
        this.promise = Promise.all(promises).then(() => this.material);
    }
}

interface MaterialDefinition {
    readonly alpha: number | undefined;
    readonly line: LineStyle | undefined;
    readonly stroke: string | undefined;
    readonly fill: string | undefined;
}

interface PaintStyleDefinition {
    readonly factoryCallback?: () => PaintStyle;
    readonly image?: string;
    readonly imageCallback?: (image: ImageResource) => PatternStyle;
}

export class MaterialCache {

    private readonly materialDefinitions = new Map<string, MaterialDefinition>();
    private readonly materials = new Map<string, MaterialElement>();
    private readonly paintStyleDefinitions = new Map<string, PaintStyleDefinition>();
    private readonly paintStyles = new Map<string, PaintStyleElement>();
    private readonly imageCache: ImageCache;

    constructor(imageCache?: ImageCache) {
        this.imageCache = imageCache == undefined ? new ImageCache() : imageCache;
    }

    defineMaterial(name: string, data: { alpha?: number, line?: LineStyle, stroke?: string, fill?: string }) {
        const def: MaterialDefinition = {
            alpha: data.alpha,
            line: data.line,
            stroke: data.stroke,
            fill: data.fill
        };
        this.materialDefinitions.set(name, def);
    }

    definePaintStyle(name: string, factoryCallback: () => PaintStyle) {
        this.paintStyleDefinitions.set(name, {
            factoryCallback
        });
    }

    definePatternStyle(name: string, image: string, factoryCallback: (image: ImageResource) => PatternStyle) {
        this.paintStyleDefinitions.set(name, {
            image,
            imageCallback: factoryCallback
        });
    }

    getMaterial(name: string): Promise<Material> {
        const paintStyleResolver = (name: string) => this.getPaintStyle(name);
        const item = this.materials.get(name);
        if (item == undefined) {
            const definition = this.materialDefinitions.get(name);
            if (definition == undefined) {
                throw new RangeError(`No material defined for ${name}`);
            }
            const newItem = new MaterialElement(definition, paintStyleResolver, () => this.materials.delete(name));
            this.materials.set(name, newItem);
            return newItem.promise;
        } else {
            return item.promise;
        }
    }

    getPaintStyle(name: string): Promise<PaintStyle> {
        const item = this.paintStyles.get(name);
        if (item == undefined) {
            const definition = this.paintStyleDefinitions.get(name);
            if (definition == undefined) {
                throw new RangeError(`No paint style defined for ${name}`);
            }
            const newItem = new PaintStyleElement(definition, this.imageCache, () => this.paintStyles.delete(name));
            this.paintStyles.set(name, newItem);
            return newItem.promise;
        } else {
            return item.promise;
        }
    }

    wait(): Promise<number> {
        return this.imageCache.wait();
    }
}