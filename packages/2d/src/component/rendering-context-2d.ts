import { ImageObject, ReadonlyRectangle, ReadonlyVector2d, Rectangle, Vector2d } from "@pluto/core";
import { Context2d } from "./context-2d";
import { Camera2d } from "../scene/camera-2d";
import { Filter, FilterStack } from "../render/filter";
import { ImagePlacement, TextHAlign, TextVAlign } from "../render";

let current: RenderingContext2d | undefined;
let currentCanvasRenderingContext2d: CanvasRenderingContext2D | undefined;

export class RenderingContext2d {

    static get current(): RenderingContext2d {
        if (current == undefined) {
            throw new Error('There is no current Context2d.');
        }
        return current;
    }

    static get currentCanvasRenderingContext2d(): CanvasRenderingContext2D {
        if (currentCanvasRenderingContext2d == undefined) {
            throw new Error('There is no current CanvasRenderingContext2D.');
        }
        return currentCanvasRenderingContext2d;

    }

    get canvasRenderingContext(): CanvasRenderingContext2D {
        return this.context.context;
    }

    private constructor(readonly context: Context2d, readonly viewport: ReadonlyRectangle, readonly camera: Camera2d, private readonly filterStack: FilterStack) {
    }

    static renderFull(context: Context2d, camera: Camera2d, filterStack: FilterStack, callback: (context: RenderingContext2d) => void) {
        const previous = current;
        const canvas = context.context.canvas;
        current = new RenderingContext2d(context, new Rectangle(0, 0, canvas.width, canvas.height), camera, filterStack);
        currentCanvasRenderingContext2d = context.context;
        currentCanvasRenderingContext2d.save();
        try {
            callback(current);
        } finally {
            currentCanvasRenderingContext2d.restore();
            current = previous;
            currentCanvasRenderingContext2d = current?.context.context;
        }
    }

    static renderSafely(callback: (ctx: RenderingContext2d) => void) {
        const ctx = this.current;
        ctx.canvasRenderingContext.save();
        try {
            callback(ctx);
        } finally {
            ctx.canvasRenderingContext.restore();
        }
    }

    static renderViewport(context: Context2d, viewport: ReadonlyRectangle, camera: Camera2d, filterStack: FilterStack, callback: (context: RenderingContext2d) => void) {
        const previous = current;
        current = new RenderingContext2d(context, viewport, camera, filterStack);
        currentCanvasRenderingContext2d = context.context;
        currentCanvasRenderingContext2d.save();
        try {
            currentCanvasRenderingContext2d.beginPath();
            currentCanvasRenderingContext2d.rect(viewport.x1, viewport.y1, viewport.width, viewport.height);
            currentCanvasRenderingContext2d.clip();
            currentCanvasRenderingContext2d.translate(viewport.x1, viewport.y1);
            callback(current);
        } finally {
            currentCanvasRenderingContext2d.restore();
            current = previous;
            currentCanvasRenderingContext2d = current?.context.context;
        }
    }

    static withFilter(filter: Filter, callback: (context: RenderingContext2d) => void) {
        const ctx = this.current;
        ctx.canvasRenderingContext.save();
        try {
            ctx.filterStack.withFilter(filter, () => {
                ctx.filterStack.use();
                callback(ctx);
            });
        } finally {
            ctx.canvasRenderingContext.restore();
        }
    }

    clear() {
        this.canvasRenderingContext.clearRect(0, 0, this.viewport.width, this.viewport.height);
    }

    createFullscreenLinearGradient(direction: ReadonlyVector2d): CanvasGradient {
        const p11 = new Vector2d(0, 0);
        const p21 = new Vector2d(this.viewport.width - 1, 0);
        const p12 = new Vector2d(0, this.viewport.height - 1);
        const p22 = new Vector2d(this.viewport.width - 1, this.viewport.height - 1);
        const dir = direction.getNormalized();
        dir.y = -dir.y;
        const d11 = p11.getDotProduct(dir);
        const d21 = p21.getDotProduct(dir);
        const d12 = p12.getDotProduct(dir);
        const d22 = p22.getDotProduct(dir);
        const min = Math.min(d11, d21, d12, d22);
        const max = Math.max(d11, d21, d12, d22);
        const p1 = p11.getSumScaled(dir, min - d11);
        const p2 = p11.getSumScaled(dir, max - d11);
        return this.canvasRenderingContext.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
    }

    drawFullscreenImage(image: ImageObject, placement: ImagePlacement) {
        switch (placement) {
            case ImagePlacement.CENTER:
                this.canvasRenderingContext.drawImage(image.canvasImageSource, (this.viewport.width - image.width) * .5, (this.viewport.height - image.height) * .5);
                break;
            case ImagePlacement.SCALED:
            case ImagePlacement.SMOOTH_SCALED:
                this.canvasRenderingContext.imageSmoothingEnabled = placement === ImagePlacement.SMOOTH_SCALED;
                const vw = this.viewport.width;
                const vh = this.viewport.height;
                const iw = image.width;
                const ih = image.height;
                const fx = vw / iw;
                const fy = vh / ih;
                const f = Math.min(fx, fy);
                this.canvasRenderingContext.drawImage(image.canvasImageSource, (vw - iw * f) * .5, (vh - ih * f) * .5, iw * f, ih * f);
                break;
            case ImagePlacement.STRETCHED:
            case ImagePlacement.SMOOTH_STRETCHED:
                this.canvasRenderingContext.imageSmoothingEnabled = placement === ImagePlacement.SMOOTH_STRETCHED;
                this.canvasRenderingContext.drawImage(image.canvasImageSource, 0, 0, this.viewport.width, this.viewport.height);
        }
    }

    fill() {
        this.canvasRenderingContext.fillRect(0, 0, this.viewport.width, this.viewport.height);
    }

    getTextOffset(text: string, bounds: ReadonlyRectangle, hAlign: TextHAlign, vAlign: TextVAlign): Vector2d {
        const m = this.canvasRenderingContext.measureText(text);
        const w = m.actualBoundingBoxRight - m.actualBoundingBoxLeft + 1;
        const h = m.fontBoundingBoxDescent + m.fontBoundingBoxAscent + 1;
        const ret = new Vector2d(bounds.x1 - m.actualBoundingBoxLeft, -bounds.y1 - m.fontBoundingBoxDescent);
        switch (hAlign) {
            case TextHAlign.CENTER:
                ret.x += (bounds.width - w) * 0.5;
                break;
            case TextHAlign.RIGHT:
                ret.x += bounds.width - w;
                break;
            case TextHAlign.START:
                if (this.canvasRenderingContext.direction === 'rtl') {
                    ret.x += bounds.width - w;
                }
                break;
            case TextHAlign.END:
                if (this.canvasRenderingContext.direction === 'ltr') {
                    ret.x += bounds.width - w;
                }
        }
        switch (vAlign) {
            case TextVAlign.CENTER:
                ret.y -= (bounds.height - h) * 0.5;
                break;
            case TextVAlign.TOP:
                ret.y -= bounds.height - h;
        }
        return ret;
    }
}