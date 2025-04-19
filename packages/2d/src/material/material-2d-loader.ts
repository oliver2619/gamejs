import { ColorStyleJson, LinearGradientStyleJson, LineStyleJson, Material2dCacheJson, Material2dJson, PaintStyleJson, PatternStyleJson, RadialGradientStyleJson } from "./material-2d-json";
import { Material2dCache } from "./material-2d-cache";
import { LineStyle } from "./line-style";
import { Color, ResourceLoader, Vector2d } from "@pluto/core";
import { ColorStopsArray } from "./color-stops";

export interface Material2dLoaderData {
    baseUrl?: string;
}

export class Material2dLoader {

    private readonly baseUrl: string | undefined;

    constructor(data?: Material2dLoader) {
        this.baseUrl = data?.baseUrl;
    }

    load(url: string, cache: Material2dCache): Promise<void> {
        return new ResourceLoader(this.baseUrl).loadJson<Material2dCacheJson>(url).then(
            json => this.loadFromJson(json, cache)
        );
    }

    loadFromJson(json: Material2dCacheJson, cache: Material2dCache) {
        Object.entries(json.lineStyles).forEach(([id, json]) => cache.registerLineStyle(id, this.loadLineStyle(json)));
        Object.entries(json.paintStyles).forEach(([id, json]) => this.loadPaintStyle(id, json, cache));
        Object.entries(json.materials).forEach(([id, json]) => this.loadMaterial(id, json, cache));
    }

    private loadColorStops(json: Array<[number, string]>): ColorStopsArray {
        return json.map(it => ({ offset: it[0], color: Color.parse(it[1]) }));
    }

    private loadLineStyle(json: LineStyleJson): LineStyle {
        return new LineStyle({
            lineCap: json.lineCap,
            lineDash: json.lineDash,
            lineDashOffset: json.lineDashOffset,
            lineJoin: json.lineJoin,
            lineWidth: json.lineWidth,
            miterLimit: json.miterLimit,
        });
    }

    private loadLinearGradientStyle(id: string, json: LinearGradientStyleJson, cache: Material2dCache) {
        cache.registerLinearGradientStyle(id, {
            colorStops: this.loadColorStops(json.stops),
            start: new Vector2d(json.start[0], json.start[1]),
            end: new Vector2d(json.end[0], json.end[1])
        });
    }

    private loadMaterial(id: string, json: Material2dJson, cache: Material2dCache) {
        cache.registerMaterial(id, {
            alpha: json.alpha ?? 1,
            fill: json.fill,
            line: json.line,
            stroke: json.stroke,
            fontFamily: json.fontFamily,
            fontSize: json.fontSize,
            fontWeight: json.fontWeight
        });
    }

    private loadPaintStyle(id: string, json: PaintStyleJson, cache: Material2dCache) {
        switch (json.type) {
            case 'color':
                cache.registerColorStyle(id, Color.parse((json as ColorStyleJson).color));
                break;
            case 'linear':
                this.loadLinearGradientStyle(id, json as LinearGradientStyleJson, cache);
                break;
            case 'pattern':
                this.loadPatternStyle(id, json as PatternStyleJson, cache);
                break;
            case 'radial':
                this.loadRadialGradientStyle(id, json as RadialGradientStyleJson, cache);
                break;
            default:
                throw new RangeError(`Paint style type ${json.type} not supported.`);
        }
    }

    private loadRadialGradientStyle(id: string, json: RadialGradientStyleJson, cache: Material2dCache) {
        cache.registerRadialGradientStyle(id, {
            colorStops: this.loadColorStops(json.stops),
            startPosition: new Vector2d(json.start[0], json.start[1]),
            startRadius: json.start[2],
            endPosition: new Vector2d(json.end[0], json.end[1]),
            endRadius: json.end[2]
        });

    }

    private loadPatternStyle(id: string, json: PatternStyleJson, cache: Material2dCache) {
        cache.registerPatternStyle(id, {
            image: json.image,
            offset: json.offset == undefined ? undefined : new Vector2d(json.offset[0], json.offset[1]),
            repetition: json.repetition,
            rotate: json.rotate,
            scale: json.scale,
        });
    }
}