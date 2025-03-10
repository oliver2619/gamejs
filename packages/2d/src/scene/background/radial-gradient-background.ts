import { ReadonlyVector2d, Vector2d } from "@pluto/core";
import { GradientBackground, GradientBackgroundData } from "./gradient-background";
import { RenderingContext2d } from "../../component/rendering-context-2d";

export interface RadialGradientBackgroundData extends GradientBackgroundData {
    start?: ReadonlyVector2d;
    end?: ReadonlyVector2d;
    radius?: number;
}

export class RadialGradientBackground extends GradientBackground {

    private readonly _end: Vector2d;
    private readonly _start: Vector2d;
    private _radius: number;

    get end(): ReadonlyVector2d {
        return this._end;
    }

    set end(e: ReadonlyVector2d) {
        if (!this._end.equals(e)) {
            this._end.setVector(e);
            this.setModified();
        }
    }

    get radius(): number {
        return this._radius;
    }

    set radius(r: number) {
        if(this._radius !== r) {
            this._radius = r;
            this.setModified();
        }
    }

    get start(): ReadonlyVector2d {
        return this._start;
    }

    set start(o: ReadonlyVector2d) {
        if (!this._start.equals(o)) {
            this._start.setVector(o);
            this.setModified();
        }
    }

    constructor(data: Readonly<RadialGradientBackgroundData>) {
        super(data);
        this._end = data.end?.clone() ?? new Vector2d(0.5, 0.5);
        this._start = data.start?.clone() ?? new Vector2d(0.5, 0.5);
        this._radius = data.radius ?? 1;
    }

    protected override createGradient(context: RenderingContext2d): CanvasGradient {
        const p = context.viewport.size;
        return context.canvasRenderingContext.createRadialGradient(this._start.x * p.x, (1 - this._start.y) * p.y, 0, this._end.x * p.x, (1 - this._end.y) * p.y, p.length * .5 * this._radius);
    }

}