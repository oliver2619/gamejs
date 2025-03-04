import { CoordSystem2dData, ImageResource, ReadonlyVector2d } from "@pluto/core";
import { Material2d } from "../../material/material-2d";

export interface SvgPathParserTarget {
    closePath(): void;
    cubicCurveTo(p1: ReadonlyVector2d, p2: ReadonlyVector2d, p3: ReadonlyVector2d): void;
    end(): void;
    lineTo(v: ReadonlyVector2d): void;
    moveTo(v: ReadonlyVector2d): void;
    quadraticCurveTo(p1: ReadonlyVector2d, p2: ReadonlyVector2d): void;
}

export interface SvgElementParserTargetData {
    classes: Set<string>;
    opacity: number;
    visible: boolean;
    id?: string;
}

export interface SvgMaterializedElementParserTargetData extends SvgElementParserTargetData {
    material: Material2d;
    fillRule?: CanvasFillRule;
    stroke: boolean;
}

export interface SvgImageParserTarget {
    setImage(image: ImageResource): void;
}

export interface SvgElementParserTarget {
    addCircle(data: { center: ReadonlyVector2d, r: number }, meta: SvgMaterializedElementParserTargetData): void;
    addEllipse(data: { center: ReadonlyVector2d, r: ReadonlyVector2d }, meta: SvgMaterializedElementParserTargetData): void;
    addGroup(data: { coordSystem: CoordSystem2dData }, meta: SvgMaterializedElementParserTargetData): SvgElementParserTarget;
    addImage(data: { x: number, y: number, width: number, height: number }, meta: SvgElementParserTargetData): SvgImageParserTarget;
    addLine(data: { p1: ReadonlyVector2d, p2: ReadonlyVector2d }, meta: SvgMaterializedElementParserTargetData): void;
    addPath(meta: SvgMaterializedElementParserTargetData): SvgPathParserTarget;
    addPolygon(data: { points: ReadonlyVector2d[] }, meta: SvgMaterializedElementParserTargetData): void;
    addPolyline(data: { points: ReadonlyVector2d[] }, meta: SvgMaterializedElementParserTargetData): void;
    addRect(data: { x: number, y: number, width: number, height: number }, meta: SvgMaterializedElementParserTargetData): void;
}

export interface SvgParserTarget {
    readonly root: SvgElementParserTarget;
    getImage(url: string): Promise<ImageResource>;
    getPatternImage(patternName: string): Promise<ImageResource>;
}