import { Box2d, CoordSystem2d, CoordSystem2dData, ReadonlyBox2d, ReadonlyCoordSystem2d, ReadonlyVector2d, Vector2d } from "@pluto/core";
import { RenderingContext2d } from "../component/rendering-context-2d";
import { Object2dBase, ReadonlyObject2dBase } from "./object-2d-base";

export interface ReadonlyCamera2d extends ReadonlyObject2dBase {
    readonly zoom: number;
    use(): void;
}

export interface Camera2dData extends CoordSystem2dData {
    zoom?: number;
}

export class Camera2d implements Object2dBase, ReadonlyCamera2d {
    private readonly _matrix: DOMMatrix = new DOMMatrix();
    private readonly _invertedMatrix: DOMMatrix = new DOMMatrix();
    private readonly _coordSystem: CoordSystem2d;
    private _zoom: number;
    private matrixModified = false;
    private _boundingBox: Box2d = Box2d.empty();
    private boundingBoxViewportSize = new Vector2d(0, 0);

    get coordSystem(): ReadonlyCoordSystem2d {
        return this._coordSystem;
    }

    get boundingBox(): ReadonlyBox2d {
        return this._boundingBox;
    }

    get zoom(): number {
        return this._zoom;
    }

    set zoom(z: number) {
        if (this._zoom !== z) {
            this._zoom = z;
            this.matrixModified = true;
        }
    }

    constructor(data?: Readonly<Camera2dData>) {
        this._coordSystem = new CoordSystem2d(data);
        this._zoom = data?.zoom ?? 1;
        this.updateMatrix();
    }

    updateCoordSystem(callback: (coordSystem: CoordSystem2d) => void) {
        callback(this._coordSystem);
        this.matrixModified = true;
    }

    use() {
        const context = RenderingContext2d.current;
        this.checkUpdate(context.viewport.size);
        context.canvasRenderingContext.translate(context.viewport.width * 0.5, context.viewport.height * 0.5);
        const m = this._matrix;
        context.canvasRenderingContext.transform(m.a, -m.b, m.c, -m.d, m.e, -m.f);
    }

    private checkUpdate(viewportSize: ReadonlyVector2d) {
        const modified = this.matrixModified;
        if (this.matrixModified) {
            this.updateMatrix();
            this.matrixModified = false;
        }
        if (modified || viewportSize.x !== this.boundingBoxViewportSize.x || viewportSize.y !== this.boundingBoxViewportSize.y) {
            this.updateBoundingBox(viewportSize);
        }
    }

    private updateBoundingBox(viewportSize: ReadonlyVector2d) {
        this._boundingBox.clear();
        const m = this._invertedMatrix;
        const x = viewportSize.x * 0.5;
        const y = viewportSize.y * 0.5;
        this._boundingBox.extend(-m.a * x + m.c * y + m.e, -m.b * x + m.d * y - m.f);
        this._boundingBox.extend(m.a * x + m.c * y + m.e, m.b * x + m.d * y - m.f);
        this._boundingBox.extend(-m.a * x - m.c * y + m.e, -m.b * x - m.d * y - m.f);
        this._boundingBox.extend(m.a * x - m.c * y + m.e, m.b * x - m.d * y - m.f);
        this.boundingBoxViewportSize.setVector(viewportSize);
    }

    private updateMatrix() {
        const m = this._matrix;
        m.a = this._coordSystem.xAxis.x;
        m.b = -this._coordSystem.xAxis.y;
        m.c = this._coordSystem.yAxis.x;
        m.d = -this._coordSystem.yAxis.y;
        m.e = this._coordSystem.position.x;
        m.f = -this._coordSystem.position.y;
        m.scaleSelf(1 / this._zoom, 1 / this._zoom);
        m.invertSelf();
        const i = this._invertedMatrix;
        i.a = this._coordSystem.xAxis.x;
        i.b = -this._coordSystem.xAxis.y;
        i.c = this._coordSystem.yAxis.x;
        i.d = -this._coordSystem.yAxis.y;
        i.e = this._coordSystem.position.x;
        i.f = -this._coordSystem.position.y;
        i.scaleSelf(this._zoom, this._zoom);
    }
}