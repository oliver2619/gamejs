import { Color, ImageCache, ReadonlyCoordSystem2d, ReadonlyVector2d } from "@pluto/core";
import { LineStyle, LineStyleData } from "./line-style";
import { Material2d } from "./material-2d";
import { PaintStyle } from "./paint-style";
import { PatternRepetition, PatternStyle } from "./pattern-style";
import { ColorStyle } from "./color-style";
import { LinearGradientStyle, LinearGradientStyleData } from "./linear-gradient-style";
import { RadialGradientStyle, RadialGradientStyleData } from "./radial-gradient-style";
import { TextMaterial } from "./text-material";

class PaintStyleElement {

    readonly promise: Promise<PaintStyle>;

    constructor(definition: PaintStyleDefinition) {
        this.promise = definition();
    }
}

class Material2dElement {

    readonly promise: Promise<Material2d>;
    private readonly material: Material2d;

    constructor(definition: MaterialDefinition, lineStyleResolver: (name: string) => LineStyle, paintStyleResolver: (name: string) => Promise<PaintStyle>, onDelete: () => void) {
        if (definition.fontFamily == undefined && definition.fontSize == undefined && definition.fontWeight == undefined) {
            this.material = new TextMaterial({
                alpha: definition.alpha,
                line: definition.line == undefined ? undefined : lineStyleResolver(definition.line),
                fontFamily: definition.fontFamily,
                fontSize: definition.fontSize,
                fontWeight: definition.fontWeight
            });
        } else {
            this.material = new Material2d({
                alpha: definition.alpha,
                line: definition.line == undefined ? undefined : lineStyleResolver(definition.line),
            });
        }
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
        this.promise = Promise.all(promises)
            .then(() => this.material)
            .catch(err => {
                onDelete();
                throw err;
            });
    }
}

interface MaterialDefinition {
    readonly alpha: number | undefined;
    readonly line: string | undefined;
    readonly stroke: string | undefined;
    readonly fill: string | undefined;
    readonly fontSize: number | undefined;
    readonly fontFamily: string | undefined;
    readonly fontWeight: string | undefined;
}

type PaintStyleDefinition = () => Promise<PaintStyle>;

export class Material2dCache {

    static readonly GLOBAL = new Material2dCache();

    private readonly materialDefinitions = new Map<string, MaterialDefinition>();
    private readonly materials = new Map<string, Material2dElement>();
    private readonly paintStyleDefinitions = new Map<string, PaintStyleDefinition>();
    private readonly paintStyles = new Map<string, PaintStyleElement>();
    private readonly lineStyles = new Map<string, LineStyle>();

    constructor(private readonly parent?: Material2dCache) { }

    getLineStyle(name: string): LineStyle {
        const ret = this.lineStyles.get(name);
        if (ret == undefined) {
            if (this.parent == undefined) {
                throw new RangeError(`Line style ${name} not found.`);
            } else {
                return this.parent.getLineStyle(name);
            }
        }
        return ret;
    }

    getMaterial(name: string): Promise<Material2d> {
        const lineStyleResolver = (lineStyleName: string) => this.getLineStyle(lineStyleName);
        const paintStyleResolver = (paintStyleName: string) => this.getPaintStyle(paintStyleName);
        const item = this.materials.get(name);
        if (item == undefined) {
            const definition = this.materialDefinitions.get(name);
            if (definition == undefined) {
                if (this.parent == undefined) {
                    throw new RangeError(`No material defined for ${name}.`);
                } else {
                    return this.parent.getMaterial(name);
                }
            }
            const newItem = new Material2dElement(definition, lineStyleResolver, paintStyleResolver, () => this.materials.delete(name));
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
                if (this.parent == undefined) {
                    throw new RangeError(`No paint style defined for ${name}.`);
                } else {
                    return this.parent.getPaintStyle(name);
                }
            }
            const newItem = new PaintStyleElement(definition);
            this.paintStyles.set(name, newItem);
            return newItem.promise;
        } else {
            return item.promise;
        }
    }

    registerMaterial(name: string, data: {
        alpha?: number | undefined,
        line?: string | undefined,
        stroke?: string | undefined,
        fill?: string | undefined,
        fontFamily?: string | undefined,
        fontSize?: number | undefined,
        fontWeight?: string | undefined,
    }) {
        if (data.stroke == undefined && data.fill == undefined) {
            console.warn(`Neither fill nor stroke style is set. Material '${name}' will be invisible.`);
        }
        const def: MaterialDefinition = {
            alpha: data.alpha,
            line: data.line,
            stroke: data.stroke,
            fill: data.fill,
            fontFamily: data.fontFamily,
            fontSize: data.fontSize,
            fontWeight: data.fontWeight,
        };
        this.materialDefinitions.set(name, def);
    }

    registerColorStyle(name: string, color: Color) {
        this.paintStyleDefinitions.set(name, () => {
            const style = new ColorStyle(color);
            style.onPostDelete.subscribeOnce(() => this.paintStyles.delete(name));
            return Promise.resolve(style);
        });
    }

    registerLinearGradientStyle(name: string, gradient: LinearGradientStyleData) {
        this.paintStyleDefinitions.set(name, () => {
            const style = new LinearGradientStyle(gradient);
            style.onPostDelete.subscribeOnce(() => this.paintStyles.delete(name));
            return Promise.resolve(style);
        });
    }

    registerLineStyle(name: string, lineStyle: LineStyleData) {
        this.lineStyles.set(name, new LineStyle(lineStyle));
    }

    registerPatternStyle(name: string, pattern: {
        image: string,
        offset?: ReadonlyVector2d | undefined,
        repetition?: PatternRepetition | undefined,
        rotate?: number | undefined,
        scale?: number | undefined,
        transform?: ReadonlyCoordSystem2d | undefined,
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

    registerRadialGradientStyle(name: string, gradient: RadialGradientStyleData) {
        this.paintStyleDefinitions.set(name, () => {
            const style = new RadialGradientStyle(gradient);
            style.onPostDelete.subscribeOnce(() => this.paintStyles.delete(name));
            return Promise.resolve(style);
        });
    }
}