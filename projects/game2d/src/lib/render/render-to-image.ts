import { ImageResource } from "core";
import { RenderingContext2d } from "./rendering-context2d";

export interface RenderToImageData {

    readonly width: number;
    readonly height: number;
    readonly alpha?: boolean;
    readonly callback: (context: RenderingContext2d) => void;
}

export class RenderToImage {

    readonly image: ImageResource;

    private readonly context: RenderingContext2d;
    private readonly callback: (context: RenderingContext2d) => void;
    private readonly canvas: HTMLCanvasElement;

    constructor(data: RenderToImageData) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = data.width;
        this.canvas.height = data.height;
        this.callback = data.callback;
        this.image = new ImageResource(this.canvas, data.alpha == undefined ? false : data.alpha, 1, () => { });
        const ctx = this.canvas.getContext('2d', { alpha: data.alpha == undefined ? false : data.alpha, willReadFrequently: false });
        if (ctx == null) {
            throw new Error('Failed to get context 2d');
        }
        this.context = new RenderingContext2d(ctx, { imageSmoothing: 'high' });
    }

    update() {
        this.context.renderFullSized(ctx => this.callback(ctx));
    }
}