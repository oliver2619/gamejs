import { Box2d, CoordSystem2d, CoordSystem2dData, ReadonlyBox2d, ReadonlyCoordSystem2d, ReadonlyVector2d, Vector2d } from "@pluto/core";
import { RenderingContext2d } from "../component/rendering-context-2d";

export interface Camera2dData extends CoordSystem2dData {
    zoom?: number;
}

export class Camera2d {
    private _coordSystem: CoordSystem2d;
    private _matrix: DOMMatrix;
    private _invertedMatrix: DOMMatrix;
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
        this._matrix = this.createMatrix();
        this._invertedMatrix = this._matrix.inverse();
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
        context.canvasRenderingContext.transform(m.a, m.b, m.c, m.d, m.e, m.f);
    }

    private checkUpdate(viewportSize: ReadonlyVector2d) {
        const modified = this.matrixModified;
        if (this.matrixModified) {
            this._matrix = this.createMatrix();
            this._invertedMatrix = this._matrix.inverse();
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

    private createMatrix(): DOMMatrix {
        const m = new DOMMatrix([this._coordSystem.xAxis.x, this._coordSystem.yAxis.x, this._coordSystem.xAxis.y, this._coordSystem.yAxis.y, this._coordSystem.position.x, -this._coordSystem.position.y]);
        m.scaleSelf(1 / this._zoom, 1 / this._zoom);
        m.invertSelf();
        return m;
    }
}