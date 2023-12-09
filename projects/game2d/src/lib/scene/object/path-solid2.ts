import { Box2 } from "projects/core/src/public-api";
import { Material } from "../../material";
import { PathObject, RenderingContext2d } from "../../render";
import { Solid2, Solid2Data } from "./solid2";

export interface PathSolid2Data extends Solid2Data {

    readonly path: PathObject;
    readonly material?: Material;
    readonly fillRule?: CanvasFillRule;
}

export class PathSolid2 extends Solid2 {

    fillRule: CanvasFillRule;

    private _path: PathObject;
    private _material: Material;

    get material(): Material {
        return this._material;
    }

    set material(m: Material) {
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
            this.updateBoundingBox();
        }
    }

    constructor(data: PathSolid2Data) {
        super(data);
        this._path = data.path;
        this._material = data.material == undefined ? new Material() : data.material;
        this.fillRule = data.fillRule == undefined ? 'nonzero' : data.fillRule;
        this._material.addReference(this);
    }

    protected calculateBoundingBox(box: Box2) {
        box.extendByBox(this._path.boundingBox);
    }

    protected onDispose() {
        this._material.releaseReference(this);
    }

    protected onRenderSafely(context: RenderingContext2d) {
        this._material.use(context.context, () => this._path.fill(this.fillRule, context.context), () => this._path.stroke(context.context))
    }

}