import { Vector2d } from "@pluto/core";

export class Context2d {

    get canvas(): HTMLCanvasElement {
        return this.context.canvas;
    }

    get size(): Vector2d {
        return new Vector2d(this.context.canvas.width, this.context.canvas.height);
    }

    constructor(readonly context: CanvasRenderingContext2D, imageSmoothing?: ImageSmoothingQuality | undefined) {
        context.imageSmoothingEnabled = imageSmoothing != undefined;
        if (imageSmoothing != undefined) {
            context.imageSmoothingQuality = imageSmoothing;
        }
    }

    clear() {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    }

    duplicate(imageSmoothing?: ImageSmoothingQuality): Context2d {
        const canvas = document.createElement('canvas');
        canvas.width = this.context.canvas.width;
        canvas.height = this.context.canvas.height;
        const ctx = canvas.getContext('2d', {
            alpha: true,
            willReadFrequently: true,
        });
        if (ctx == null) {
            throw new Error('Failed to create CanvasRenderingContext2D.');
        }
        return new Context2d(ctx, imageSmoothing);

    }

    getAlpha(x: number, y: number, defaultValue: number): number {
        const ix = x | 0;
        const iy = y | 0;
        if (ix < 0 || iy < 0 || ix >= this.context.canvas.width || iy >= this.context.canvas.height) {
            return defaultValue;
        }
        const data = this.context.getImageData(ix, iy, 1, 1);
        return data.data[3]! / 255;

    }
}