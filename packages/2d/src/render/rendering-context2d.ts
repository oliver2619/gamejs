import { ReadonlyBox2, ReadonlyRectangle, ReadonlyVector2, Vector2 } from 'core/src/index';
import { Filter } from "./filter";
import { ImagePlacement } from '../index';
import { TextHAlign, TextVAlign } from './text-align';

export interface RenderingContext2dData {

    readonly imageSmoothing?: ImageSmoothingQuality;
}

export class RenderingContext2d {

    private _viewportSize = new Vector2(0, 0);
    private filter = new Filter();

    get viewportSize(): ReadonlyVector2 {
        return this._viewportSize;
    }

    constructor(readonly context: CanvasRenderingContext2D, data: RenderingContext2dData) {
        context.imageSmoothingEnabled = data.imageSmoothing != undefined;
        if (data.imageSmoothing != undefined) {
            context.imageSmoothingQuality = data.imageSmoothing;
        }
    }

    clear() {
        this.context.clearRect(0, 0, this._viewportSize.x, this._viewportSize.y);
    }

    duplicateWithNewCanvas(frequentlyRead: boolean): RenderingContext2d {
        const canvas = document.createElement('canvas');
        canvas.width = this.context.canvas.width;
        canvas.height = this.context.canvas.height;
        const ctx = canvas.getContext('2d', {
            alpha: true,
            willReadFrequently: frequentlyRead
        });
        if (ctx == null) {
            throw new Error('Failed to create 2d rendering context');
        }
        return new RenderingContext2d(ctx, { imageSmoothing: this.context.imageSmoothingEnabled ? this.context.imageSmoothingQuality : undefined });
    }

    drawFullscreenImage(image: HTMLImageElement | HTMLCanvasElement | ImageBitmap, placement: ImagePlacement) {
        switch (placement) {
            case ImagePlacement.CENTER:
                this.context.drawImage(image, (this.viewportSize.x - image.width) * .5, (this.viewportSize.y - image.height) * .5);
                break;
            case ImagePlacement.SCALED:
            case ImagePlacement.SMOOTH_SCALED:
                this.context.imageSmoothingEnabled = placement === ImagePlacement.SMOOTH_SCALED;
                const vw = this.viewportSize.x;
                const vh = this.viewportSize.y;
                const iw = image.width;
                const ih = image.height;
                const fx = vw / iw;
                const fy = vh / ih;
                const f = Math.min(fx, fy);
                this.context.drawImage(image, (vw - iw * f) * .5, (vh - ih * f) * .5, iw * f, ih * f);
                break;
            case ImagePlacement.STRETCHED:
            case ImagePlacement.SMOOTH_STRETCHED:
                this.context.imageSmoothingEnabled = placement === ImagePlacement.SMOOTH_STRETCHED;
                this.context.drawImage(image, 0, 0, this.viewportSize.x, this.viewportSize.y);
        }
    }

    getAlpha(x: number, y: number, defaultAlpha: number): number {
        const ix = x | 0;
        const iy = y | 0;
        if (ix < 0 || iy < 0 || ix >= this.context.canvas.width || iy >= this.context.canvas.height) {
            return defaultAlpha;
        }
        const data = this.context.getImageData(ix, iy, 1, 1);
        return data.data[3] / 255;
    }

    getTextOffset(text: string, bounds: ReadonlyRectangle, hAlign: TextHAlign, vAlign: TextVAlign): Vector2 {
        const m = this.context.measureText(text);
        const w = m.actualBoundingBoxRight - m.actualBoundingBoxLeft + 1;
        const h = m.fontBoundingBoxDescent + m.fontBoundingBoxAscent + 1;
        const ret = new Vector2(bounds.x1 - m.actualBoundingBoxLeft, -bounds.y1 - m.fontBoundingBoxDescent);
        switch (hAlign) {
            case TextHAlign.CENTER:
                ret.x += (bounds.width - w) * 0.5;
                break;
            case TextHAlign.RIGHT:
                ret.x += bounds.width - w;
                break;
            case TextHAlign.START:
                if (this.context.direction === 'rtl') {
                    ret.x += bounds.width - w;
                }
                break;
            case TextHAlign.END:
                if (this.context.direction === 'ltr') {
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

    fill() {
        this.context.fillRect(0, 0, this._viewportSize.x, this._viewportSize.y);
    }

    renderFullSized(callback: (context: RenderingContext2d) => void) {
        const oldW = this._viewportSize.x;
        const oldH = this._viewportSize.y;
        this._viewportSize.set(this.context.canvas.width, this.context.canvas.height);
        this.context.save();
        try {
            callback(this);
        } finally {
            this._viewportSize.set(oldW, oldH);
            this.context.restore();
        }
    }

    renderAtViewport(viewport: ReadonlyRectangle, callback: (context: RenderingContext2d) => void) {
        const x1 = Math.max(0, viewport.x1);
        const y1 = Math.max(0, viewport.y1);
        const w = Math.min(viewport.x2 + 1, this.context.canvas.width) - x1;
        const h = Math.min(viewport.y2 + 1, this.context.canvas.height) - y1;
        if (w > 0 && h > 0) {
            const oldW = this._viewportSize.x;
            const oldH = this._viewportSize.y;
            this.context.save();
            try {
                this.context.beginPath();
                this.context.rect(x1, y1, w, h);
                this.context.clip();
                this.context.translate(x1, y1);
                this._viewportSize.set(w, h);
                callback(this);
            } finally {
                this._viewportSize.set(oldW, oldH);
                this.context.restore();
            }
        }
    }

    renderSafely(callback: (context: RenderingContext2d) => void) {
        this.context.save();
        try {
            callback(this);
        } finally {
            this.context.restore();
        }
    }

    strokeBox(box: ReadonlyBox2) {
        if (box.minimum != undefined && box.maximum != undefined) {
            this.context.strokeRect(box.minimum.x, -box.maximum!.y, box.size.x, box.size.y);
        }
    }

    withFilter(filter: Filter, callback: (context: RenderingContext2d) => void) {
        const prevFilter = this.filter;
        this.filter = this.filter.and(filter);
        this.context.save();
        try {
            this.filter.use(this.context);
            callback(this);
        } finally {
            this.context.restore();
            this.filter = prevFilter;
        }
    }
}