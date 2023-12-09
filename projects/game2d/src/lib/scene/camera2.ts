import { Box2, CoordSystem2, CoordSystem2Data, ReadonlyBox2, ReadonlyVector2, Vector2 } from 'projects/core/src/public-api';
import { RenderingContext2d } from "../render/rendering-context2d";

export interface Camera2Data extends CoordSystem2Data {
    readonly zoom?: number;
}

export class Camera2 extends CoordSystem2 {

    private _matrix: DOMMatrix;
    private _invertedMatrix: DOMMatrix;
    private _zoom: number;
    private matrixModified = false;
    private _boundingBox: Box2 = Box2.empty();
    private boundingBoxViewportSize = new Vector2(0, 0);

    get boundingBox(): ReadonlyBox2 {
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

    constructor(data: Camera2Data) {
        super(data);
        this._zoom = data.zoom == undefined ? 1 : data.zoom;
        this._matrix = this.createMatrix();
        this._invertedMatrix = this._matrix.inverse();
        this.onModify.subscribe(() => this.matrixModified = true);
    }

    use(context: RenderingContext2d) {
        this.checkUpdate(context.viewportSize);
        context.context.translate(context.viewportSize.x * 0.5, context.viewportSize.y * 0.5);
        const m = this._matrix;
        context.context.transform(m.a, m.b, m.c, m.d, m.e, m.f);
    }

    private checkUpdate(viewportSize: ReadonlyVector2) {
        const modified = this.matrixModified;
        if(this.matrixModified) {
            this._matrix = this.createMatrix();
            this._invertedMatrix = this._matrix.inverse();
            this.matrixModified = false;
        }
        if(modified || viewportSize.x !== this.boundingBoxViewportSize.x || viewportSize.y !== this.boundingBoxViewportSize.y) {
            this.updateBoundingBox(viewportSize);
        }
    }

    private updateBoundingBox(viewportSize: ReadonlyVector2) {
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
        const m = new DOMMatrix([this._xAxis.x, this._yAxis.x, this._xAxis.y, this._yAxis.y, this.position.x, -this.position.y]);
        m.scaleSelf(1 / this._zoom, 1 / this._zoom);
        m.invertSelf();
        return m;
    }
}