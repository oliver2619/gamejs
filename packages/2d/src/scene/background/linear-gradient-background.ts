import {Background} from "./background";
import {ReadonlyVector2, Vector2, Color} from "core/src/index";
import {RenderingContext2d} from "../../rendering-context2d";

class ColorStop {

    readonly color: string;
    readonly transparent: boolean;

    constructor(color: Color, readonly offset: number) {
        this.color = color.toHtmlRgba();
        this.transparent = color.a < 1;
    }
}

export interface LinearGradientBackgroundData {
    readonly alpha?: number;
    readonly direction: ReadonlyVector2;
    readonly stops: Array<{ color: Color; offset: number; }>
}

export class LinearGradientBackground implements Background {

    readonly direction: Vector2;
    alpha = 1;

    private gradient: CanvasGradient | undefined;
    private modified = true;
    private viewportSize = new Vector2(0, 0);
    private transparent = false;
    private colorStops: ColorStop[];

    readonly hasReferences = false

    constructor(data: LinearGradientBackgroundData) {
        this.alpha = data.alpha == undefined ? 1 : data.alpha;
        this.direction = data.direction.clone();
        this.colorStops = data.stops.map(it => new ColorStop(it.color, it.offset))
            .sort((s1, s2) => s1.offset - s2.offset);
        this.direction.onModify.subscribe(_ => this.modified = true);
    }

    addReference(holder: any): void {
    }

    releaseReference(holder: any): void {
    }

    removeColorStop(offset: number) {
        const found = this.colorStops.findIndex(it => it.offset === offset);
        if (found >= 0) {
            this.colorStops.splice(found, 1);
            this.modified = true;
        }
    }

    render(context: RenderingContext2d) {
        context.renderSafely(ctx => {
            if (this.transparent || this.alpha < 1) {
                ctx.clear();
            }
            ctx.context.globalAlpha *= this.alpha;
            this.updateAndUseGradient(ctx);
            ctx.fill();
        });
    }

    setColorStop(offset: number, color: Color) {
        const found = this.colorStops.findIndex(it => it.offset === offset);
        if (found >= 0) {
            this.colorStops[found] = new ColorStop(color, offset);
        } else {
            this.colorStops.push(new ColorStop(color, offset));
            this.colorStops.sort((s1, s2) => s1.offset - s2.offset);
        }
        this.modified = true;
    }

    setColorStops(...data: Array<{ color: Color; offset: number; }>) {
        this.colorStops = data.map(it => new ColorStop(it.color, it.offset))
            .sort((s1, s2) => s1.offset - s2.offset);
        this.transparent = this.colorStops.some(it => it.transparent);
        this.modified = true;
    }

    private updateAndUseGradient(context: RenderingContext2d) {
        if (this.gradient == undefined || this.modified || !this.viewportSize.equals(context.viewportSize)) {
            this.gradient = this.createGradient(context);
            this.viewportSize.setVector(context.viewportSize);
            this.modified = false;
        }
        context.context.fillStyle = this.gradient;
    }

    private createGradient(context: RenderingContext2d): CanvasGradient {
        const p11 = new Vector2(0, 0);
        const p21 = new Vector2(context.viewportSize.x - 1, 0);
        const p12 = new Vector2(0, context.viewportSize.y - 1);
        const p22 = new Vector2(context.viewportSize.x - 1, context.viewportSize.y - 1);
        const dir = this.direction.getNormalized();
        const d11 = p11.getDotProduct(dir);
        const d21 = p21.getDotProduct(dir);
        const d12 = p12.getDotProduct(dir);
        const d22 = p22.getDotProduct(dir);
        const min = Math.min(d11, d21, d12, d22);
        const max = Math.max(d11, d21, d12, d22);
        const p1 = p11.getSumScaled(dir, min - d11);
        const p2 = p11.getSumScaled(dir, max - d11);
        const ret = context.context.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        this.colorStops.forEach(it => ret.addColorStop(it.offset, it.color));
        return ret;
    }
}