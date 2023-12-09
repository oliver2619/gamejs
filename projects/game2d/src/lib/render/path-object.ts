import { ReadonlyBox2 } from "projects/core/src/public-api";

export class PathObject {

    constructor(private path: Path2D, readonly boundingBox: ReadonlyBox2) { }

    clip(fillRule: CanvasFillRule, context: CanvasRenderingContext2D) {
        context.clip(this.path, fillRule);
    }

    fill(fillRule: CanvasFillRule, context: CanvasRenderingContext2D) {
        context.fill(this.path, fillRule);
    }

    stroke(context: CanvasRenderingContext2D) {
        context.stroke(this.path);
    }
}