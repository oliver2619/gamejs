import { Box2d } from "@pluto/core";
import { Material2d } from "../../material";
import { PathObject } from "../../render/path-object";
import { Solid2d, Solid2dData } from "./solid-2d";

export interface PathSolid2dData extends Solid2dData {
    path: PathObject;
    fill?: CanvasFillRule | undefined;
    stroke?: boolean | undefined;
    material?: Material2d | undefined;
}

export class PathSolid2d extends Solid2d {

    fill: CanvasFillRule | undefined;
    stroke: boolean;

    private _path: PathObject;
    private _material: Material2d;

    get material(): Material2d {
        return this._material;
    }

    set material(m: Material2d) {
        if (this._material !== m) {
            this._material.releaseReference(this);
            this._material = m;
            this._material.addReference(this);
        }
    }

    get path(): PathObject {
        return this._path;
    }

    set path(p: PathObject) {
        if (this._path !== p) {
            this._path = p;
            this.setBoundingBoxModified();
        }
    }

    constructor(data: Readonly<PathSolid2dData>) {
        super(data);
        this._path = data.path;
        this._material = data.material ?? new Material2d();
        this.fill = data.fill;
        this.stroke = data.stroke ?? false;
        this._material.addReference(this);
        if (this.fill == undefined && this.stroke === false) {
            console.warn('Path will neither be stroked nor filled');
        }
    }

    clone(): PathSolid2d {
        return new PathSolid2d({
            name: this.name,
            alpha: this.alpha,
            blendOperation: this.blendOperation,
            visible: this.visible,
            filter: this.filter,
            clipPath: this.clipPath,
            path: this._path,
            material: this.material,
            fill: this.fill,
            stroke: this.stroke
        });
    }

    protected calculateBoundingBox(box: Box2d) {
        box.extendByBox(this._path.boundingBox);
    }

    protected onDelete() {
        this._material.releaseReference(this);
    }

    protected onRenderSafely() {
        this._material.use();
        if (this.fill != undefined) {
            this._path.fill(this.fill);
        }
        if (this.stroke) {
            this._path.stroke();
        }
    }

}