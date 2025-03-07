import { CoordSystem2dData, ImageResource, ReadonlyVector2d } from "@pluto/core";
import { Material2d } from "../../material/material-2d";

export interface SvgPathPort {
    closePath(): void;
    cubicCurveTo(p1: ReadonlyVector2d, p2: ReadonlyVector2d, p3: ReadonlyVector2d): void;
    end(): void;
    lineTo(v: ReadonlyVector2d): void;
    moveTo(v: ReadonlyVector2d): void;
    quadraticCurveTo(p1: ReadonlyVector2d, p2: ReadonlyVector2d): void;
}

export interface SvgElementData {
    classes: Set<string>;
    opacity: number;
    visible: boolean;
    id?: string | undefined;
}

export interface SvgMaterializedElementData extends SvgElementData {
    material: Material2d;
    fillRule?: CanvasFillRule | undefined;
    stroke: boolean;
}

export interface SvgImagePort {
    setImage(image: ImageResource): void;
}

export interface SvgElementPort {
    addCircle(data: { center: ReadonlyVector2d, r: number }, meta: SvgMaterializedElementData): void;
    addEllipse(data: { center: ReadonlyVector2d, r: ReadonlyVector2d }, meta: SvgMaterializedElementData): void;
    addGroup(data: { coordSystem: CoordSystem2dData }, meta: SvgMaterializedElementData): SvgElementPort;
    addImage(data: { x: number, y: number, width: number, height: number }, meta: SvgElementData): SvgImagePort;
    addLine(data: { p1: ReadonlyVector2d, p2: ReadonlyVector2d }, meta: SvgMaterializedElementData): void;
    addPath(meta: SvgMaterializedElementData): SvgPathPort;
    addPolygon(data: { points: ReadonlyVector2d[] }, meta: SvgMaterializedElementData): void;
    addPolyline(data: { points: ReadonlyVector2d[] }, meta: SvgMaterializedElementData): void;
    addRect(data: { x: number, y: number, width: number, height: number }, meta: SvgMaterializedElementData): void;
}

export interface SvgPort {
    readonly root: SvgElementPort;
    getImage(url: string): Promise<ImageResource>;
    getPatternImage(patternName: string): Promise<ImageResource>;
}