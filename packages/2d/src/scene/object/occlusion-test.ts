import { ReadonlyVector2, Vector2 } from "core/src/index";
import { BufferedLayer } from "../layer/buffered-layer";

export interface OcclusionTestData {

    readonly layer: BufferedLayer;
    readonly position?: ReadonlyVector2;
}

export class OcclusionTest {

    readonly position: Vector2;

    private readonly layer: BufferedLayer;

    private _alpha = 0;

    get alpha(): number {
        return this._alpha;
    }

    constructor(data: OcclusionTestData) {
        this.layer = data.layer;
        this.position = data.position == undefined ? new Vector2(0, 0) : data.position.clone();
    }

    update(context: CanvasRenderingContext2D) {
        const matrix = context.getTransform();
        const x = matrix.a * this.position.x - matrix.c * this.position.y + matrix.e;
        const y = matrix.b * this.position.x - matrix.d * this.position.y + matrix.f;
        this._alpha = 1 - this.layer.getAlpha(x, y, 1);
    }
}