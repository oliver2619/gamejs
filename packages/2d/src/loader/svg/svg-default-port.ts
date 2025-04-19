import { CoordSystem2dData, ImageFactory, ImageResource, ReadonlyVector2d, Vector2d } from "@pluto/core";
import { PathBuilder } from "../../render/path-builder";
import { PathObject } from "../../render/path-object";
import { SvgElementData, ElementPortBak, SvgImagePortBak, SvgMaterializedElementData, SvgPathPort, SvgPortBak } from "./svg-port-bak";
import { ImageSolid2d, Object2d, PathSolid2d, Solid2d } from "../../scene";
import { Object2dLoaderImageMapper, Object2dLoaderPatternMapper } from "../object-2d-loader";

class SvgPathDefaultPort implements SvgPathPort {

    private readonly builder = new PathBuilder();

    constructor(private readonly onComplete: (path: PathObject) => void) { }

    closePath() {
        this.builder.closePath();
    }

    cubicCurveTo(p1: ReadonlyVector2d, p2: ReadonlyVector2d, p3: ReadonlyVector2d) {
        this.builder.bezierCurveTo(p1, p2, p3);
    }

    end() {
        this.onComplete(this.builder.build());
    }

    lineTo(v: ReadonlyVector2d) {
        this.builder.lineTo(v.x, v.y);
    }

    moveTo(v: ReadonlyVector2d) {
        this.builder.moveTo(v.x, v.y);
    }

    quadraticCurveTo(p1: ReadonlyVector2d, p2: ReadonlyVector2d) {
        this.builder.quadraticCurveTo(p1, p2);
    }
}

class SvgImageDefaultPort implements SvgImagePortBak {

    constructor(readonly imageSolid: ImageSolid2d) { }

    setImage(image: ImageResource): void {
        this.imageSolid.image = image;
    }
}

class SvgElementDefaultPort implements ElementPortBak {

    readonly object: Object2d;

    constructor(
        private readonly objectsByName: { [key: string]: Object2d },
        private readonly solidsByName: { [key: string]: Solid2d },
        coordSystem: CoordSystem2dData
    ) {
        this.object = new Object2d({ ...coordSystem });
    }

    addCircle(data: { center: ReadonlyVector2d, r: number }, meta: SvgMaterializedElementData) {
        const path = new PathBuilder().circle(data.center.x, data.center.y, data.r).build();
        this.addPathObject(path, meta);
    }

    addEllipse(data: { center: ReadonlyVector2d, r: ReadonlyVector2d }, meta: SvgMaterializedElementData) {
        const path = new PathBuilder().ellipse(data.center, data.r, 0).build();
        this.addPathObject(path, meta);
    }

    addGroup(data: { coordSystem: CoordSystem2dData }, meta: SvgMaterializedElementData): ElementPortBak {
        const ret = new SvgElementDefaultPort(this.objectsByName, this.solidsByName, data.coordSystem);
        ret.object.visible = meta.visible;
        this.object.addPart(ret.object);
        if (meta.id != undefined) {
            this.objectsByName[meta.id] = ret.object;
        }
        return ret;
    }

    addImage(data: { x: number, y: number, width: number, height: number }, meta: SvgElementData): SvgImagePortBak {
        const solid = new ImageSolid2d({
            image: new ImageResource(ImageFactory.emptyImage(8), 1),
            position: new Vector2d(data.x, data.y),
            alpha: meta.opacity,
            visible: meta.visible
        });
        this.object.addPart(solid);
        if (meta.id != undefined) {
            this.solidsByName[meta.id] = solid;
        }
        return new SvgImageDefaultPort(solid);
    }

    addLine(data: { p1: ReadonlyVector2d, p2: ReadonlyVector2d }, meta: SvgMaterializedElementData) {
        const path = new PathBuilder().moveTo(data.p1.x, data.p1.y).lineTo(data.p2.x, data.p2.y).build();
        return this.addPathObject(path, meta);
    }

    addPath(meta: SvgMaterializedElementData): SvgPathPort {
        return new SvgPathDefaultPort(it => this.addPathObject(it, meta));
    }

    addPolygon(data: { points: ReadonlyVector2d[] }, meta: SvgMaterializedElementData) {
        const path = new PathBuilder().polygon(data.points.map(it => [it.x, it.y])).closePath().build();
        return this.addPathObject(path, meta);
    }

    addPolyline(data: { points: ReadonlyVector2d[] }, meta: SvgMaterializedElementData) {
        const path = new PathBuilder().polygon(data.points.map(it => [it.x, it.y])).build();
        return this.addPathObject(path, meta);
    }

    addRect(data: { x: number, y: number, width: number, height: number }, meta: SvgMaterializedElementData) {
        const path = new PathBuilder().rectangle(data.x, data.y, data.width, data.height).build();
        return this.addPathObject(path, meta);
    }

    private addPathObject(path: PathObject, meta: SvgMaterializedElementData) {
        const s = new PathSolid2d({
            path,
            // TODO clipPath: this.getClipPath(el, context),
            material: meta.material,
            fill: meta.fillRule,
            stroke: meta.stroke,
            alpha: meta.opacity,
            visible: meta.visible
        });
        this.object.addPart(s);
        if (meta.id != undefined) {
            this.solidsByName[meta.id] = s;
        }
    }
}

export class SvgDefaultPort implements SvgPortBak {

    private readonly objectsByName: { [key: string]: Object2d } = {};
    private readonly solidsByName: { [key: string]: Solid2d } = {};

    readonly root = new SvgElementDefaultPort(this.objectsByName, this.solidsByName, {});

    private readonly imageMapper: Object2dLoaderImageMapper;
    private readonly patternMapper: Object2dLoaderPatternMapper;

    constructor(data: { patternMapper: Object2dLoaderPatternMapper, imageMapper: Object2dLoaderImageMapper }) {
        this.imageMapper = data.imageMapper;
        this.patternMapper = data.patternMapper;
    }

    getImage(url: string): Promise<ImageResource> {
        return this.imageMapper(url);
    }

    getPatternImage(patternName: string): Promise<ImageResource> {
        return this.patternMapper(patternName);
    }

    getResult(): Promise<Object2d> {
        return Promise.resolve(this.root.object);
    }
}