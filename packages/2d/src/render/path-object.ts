import { ReadonlyBox2d } from "@pluto/core";
import { RenderingContext2d } from "../component/rendering-context-2d";

export class PathObject {

    constructor(private path: Path2D, readonly boundingBox: ReadonlyBox2d) { }

    clip(fillRule: CanvasFillRule) {
        RenderingContext2d.currentCanvasRenderingContext2d.clip(this.path, fillRule);
    }

    fill(fillRule: CanvasFillRule) {
        RenderingContext2d.currentCanvasRenderingContext2d.fill(this.path, fillRule);
    }

    stroke() {
        RenderingContext2d.currentCanvasRenderingContext2d.stroke(this.path);
    }
}