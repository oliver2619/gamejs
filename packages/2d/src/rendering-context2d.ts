import {ReadonlyRectangle, ReadonlyVector2, Vector2} from 'core/src/index';
import {Filter} from "./filter";

export class RenderingContext2d {

    private _viewportSize = new Vector2(0, 0);
    private filter = new Filter();

    get viewportSize(): ReadonlyVector2 {
        return this._viewportSize;
    }

    constructor(readonly context: CanvasRenderingContext2D) {
    }

    clear() {
        this.context.clearRect(0, 0, this._viewportSize.x, this._viewportSize.y);
    }

    duplicateWithNewCanvas(): RenderingContext2d {
        const canvas = new HTMLCanvasElement();
        canvas.width = this.context.canvas.width;
        canvas.height = this.context.canvas.height;
        const ctx = canvas.getContext('2d', {
            alpha: true
        });
        if (ctx == null) {
            throw new Error('Failed to create 2d rendering context');
        }
        ctx.imageSmoothingQuality = this.context.imageSmoothingQuality;
        ctx.imageSmoothingEnabled = this.context.imageSmoothingEnabled;
        return new RenderingContext2d(ctx);
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
        const w = Math.min(viewport.x2, this.context.canvas.width) - x1;
        const h = Math.min(viewport.y2, this.context.canvas.height) - y1;
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

    renderSafely(callback: (context: RenderingContext2d) => void) {
        this.context.save();
        try {
            callback(this);
        } finally {
            this.context.restore();
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