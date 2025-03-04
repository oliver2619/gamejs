import { ReadonlyVector2d, Vector2d } from "@pluto/core";
import { BufferedLayer } from "../layer/buffered-layer";
import { RenderingContext2d } from "../../component/rendering-context-2d";

export interface OcclusionTestData {

    readonly layer: BufferedLayer;
    readonly position?: ReadonlyVector2d;
}

export class OcclusionTest {

    position: Vector2d;

    private readonly layer: BufferedLayer;
    private _alpha = 0;

    get alpha(): number {
        return this._alpha;
    }

    constructor(data: OcclusionTestData) {
        this.layer = data.layer;
        this.position = data.position?.clone() ?? new Vector2d(0, 0);
    }

    update() {
        const matrix = RenderingContext2d.currentCanvasRenderingContext2d.getTransform();
        const x = matrix.a * this.position.x - matrix.c * this.position.y + matrix.e;
        const y = matrix.b * this.position.x - matrix.d * this.position.y + matrix.f;
        this._alpha = 1 - this.layer.getAlpha(x, y, 1);
    }
}