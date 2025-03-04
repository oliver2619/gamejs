import { ImageObject } from "@pluto/core";
import { Context2d } from "../component/context-2d";
import { RenderingContext2d } from "../component/rendering-context-2d";
import { Camera2d } from "../scene";
import { FilterStack } from "./filter";

export interface RenderToImageData {

    readonly width: number;
    readonly height: number;
    readonly alpha?: boolean;
    readonly imageSmoothing?: ImageSmoothingQuality;
    readonly filterStack?: FilterStack;
    readonly callback: () => void;
}

export class RenderToImage {

    readonly image: ImageObject;
    readonly filterStack: FilterStack;

    private readonly context: Context2d;
    private readonly callback: () => void;
    private readonly canvas: HTMLCanvasElement;

    constructor(data: RenderToImageData) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = data.width;
        this.canvas.height = data.height;
        this.callback = data.callback;
        this.filterStack = data.filterStack ?? new FilterStack();
        const alpha = data.alpha ?? false;
        this.image = new ImageObject(this.canvas, alpha);
        const ctx = this.canvas.getContext('2d', { alpha, willReadFrequently: true });
        if (ctx == null) {
            throw new Error('Failed to get CanvasRenderingContext2D.');
        }
        this.context = new Context2d(ctx, data.imageSmoothing ?? 'high');
    }

    renderToImage(camera: Camera2d) {
        RenderingContext2d.renderFull(this.context, camera, this.filterStack, this.callback);
    }

}