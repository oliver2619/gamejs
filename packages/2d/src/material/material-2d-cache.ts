import { Color, ImageCache, ReadonlyCoordSystem2d, ReadonlyVector2d } from "@pluto/core";
import { LineStyle } from "./line-style";
import { Material2d } from "./material-2d";
import { PaintStyle } from "./paint-style";
import { PatternRepetition, PatternStyle } from "./pattern-style";
import { ColorStyle } from "./color-style";
import { LinearGradientStyle, LinearGradientStyleData } from "./linear-gradient-style";
import { RadialGradientStyle, RadialGradientStyleData } from "./radial-gradient-style";

class PaintStyleElement {

    readonly promise: Promise<PaintStyle>;

    constructor(definition: PaintStyleDefinition) {
        this.promise = definition();
    }
}

class Material2dElement {

    readonly promise: Promise<Material2d>;
    private readonly material: Material2d;

    constructor(definition: MaterialDefinition, paintStyleResolver: (name: string) => Promise<PaintStyle>, onDelete: () => void) {
        this.material = new Material2d({
            alpha: definition.alpha,
            line: definition.line,
        });
        this.material.onPostDelete.subscribeOnce(onDelete);
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

type PaintStyleDefinition = () => Promise<PaintStyle>;

export class Material2dCache {

    private static readonly materialDefinitions = new Map<string, MaterialDefinition>();
    private static readonly materials = new Map<string, Material2dElement>();
    private static readonly paintStyleDefinitions = new Map<string, PaintStyleDefinition>();
    private static readonly paintStyles = new Map<string, PaintStyleElement>();

    private constructor() { }

    static getMaterial(name: string): Promise<Material2d> {
        const paintStyleResolver = (paintStyleName: string) => this.getPaintStyle(paintStyleName);
        const item = this.materials.get(name);
        if (item == undefined) {
            const definition = this.materialDefinitions.get(name);
            if (definition == undefined) {
                throw new RangeError(`No material defined for ${name}.`);
            }
            const newItem = new Material2dElement(definition, paintStyleResolver, () => this.materials.delete(name));
            this.materials.set(name, newItem);
            return newItem.promise;
        } else {
            return item.promise;
        }
    }

    static getPaintStyle(name: string): Promise<PaintStyle> {
        const item = this.paintStyles.get(name);
        if (item == undefined) {
            const definition = this.paintStyleDefinitions.get(name);
            if (definition == undefined) {
                throw new RangeError(`No paint style defined for ${name}.`);
            }
            const newItem = new PaintStyleElement(definition);
            this.paintStyles.set(name, newItem);
            return newItem.promise;
        } else {
            return item.promise;
        }
    }

    static registerMaterial(name: string, data: { alpha?: number, line?: LineStyle, stroke?: string, fill?: string }) {
        if (data.stroke == undefined && data.fill == undefined) {
            console.warn(`Neither fill nor stroke style is set. Material '${name}' will be invisible.`);
        }
        const def: MaterialDefinition = {
            alpha: data.alpha,
            line: data.line,
            stroke: data.stroke,
            fill: data.fill
        };
        this.materialDefinitions.set(name, def);
    }

    static registerColorStyle(name: string, color: Color) {
        this.paintStyleDefinitions.set(name, () => {
            const style = new ColorStyle(color);
            style.onPostDelete.subscribeOnce(() => this.paintStyles.delete(name));
            return Promise.resolve(style);
        });
    }

    static registerLinearGradientStyle(name: string, gradient: LinearGradientStyleData) {
        this.paintStyleDefinitions.set(name, () => {
            const style = new LinearGradientStyle(gradient);
            style.onPostDelete.subscribeOnce(() => this.paintStyles.delete(name));
            return Promise.resolve(style);
        });
    }

    static registerPatternStyle(name: string, pattern: {
        image: string,
        offset?: ReadonlyVector2d,
        repetition?: PatternRepetition,
        rotate?: number,
        scale?: number,
        transform?: ReadonlyCoordSystem2d,
    }) {
        this.paintStyleDefinitions.set(name, () => {
            return ImageCache.get(pattern.image).then(image => {
                const style = new PatternStyle({
                    image: image,
                    offset: pattern.offset,
                    repetition: pattern.repetition,
                    rotate: pattern.rotate,
                    scale: pattern.scale,
                    transform: pattern.transform,
                });
                style.onPostDelete.subscribeOnce(() => this.paintStyles.delete(name));
                return style;
            });
        });
    }

    static registerRadialGradientStyle(name: string, gradient: RadialGradientStyleData) {
        this.paintStyleDefinitions.set(name, () => {
            const style = new RadialGradientStyle(gradient);
            style.onPostDelete.subscribeOnce(() => this.paintStyles.delete(name));
            return Promise.resolve(style);
        });
    }
}