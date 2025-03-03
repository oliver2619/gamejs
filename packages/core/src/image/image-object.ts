export class ImageObject {

    readonly height: number;
    readonly width: number;
    readonly alpha: boolean;

    private _image: HTMLImageElement | SVGImageElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | undefined;
    private _imageData: ImageData | undefined;
    private _context: CanvasRenderingContext2D | undefined;

    get canvasImageSource(): CanvasImageSource {
        if (this._image == undefined) {
            this._image = this.createImage();
        }
        return this._image;
    }

    get imageData(): ImageData {
        if (this._imageData == undefined) {
            this._imageData = this.createImageData();
        }
        return this._imageData;
    }

    constructor(image: HTMLImageElement | SVGImageElement | HTMLCanvasElement | ImageBitmap | ImageData | OffscreenCanvas | CanvasRenderingContext2D, alpha?: boolean) {
        if (image instanceof SVGImageElement) {
            this.width = image.width.baseVal.value;
            this.height = image.height.baseVal.value;
        } else if (image instanceof CanvasRenderingContext2D) {
            this.width = image.canvas.width;
            this.height = image.canvas.height;
        } else {
            this.width = image.width;
            this.height = image.height;
        }
        if (image instanceof ImageData) {
            this._imageData = image;
        } else if (image instanceof CanvasRenderingContext2D) {
            this._context = image;
            this._image = image.canvas;
        } else {
            this._image = image;
        }
        this.alpha = alpha ?? this.isTransparent();
    }

    render(left: number, bottom: number, context: CanvasRenderingContext2D) {
        context.drawImage(this.canvasImageSource, left, 1 - this.height - bottom);
    }

    renderMultiImage(left: number, bottom: number, imageNo: number, numberOfImages: number, scale: number, context: CanvasRenderingContext2D) {
        let i: number;
        if (imageNo < 0) {
            i = numberOfImages - ((Math.round(-imageNo) - 1) % numberOfImages) - 1;
        } else {
            i = Math.round(imageNo) % numberOfImages;
        }
        const height = this.height / numberOfImages;
        context.drawImage(this.canvasImageSource, 0, i * height, this.width, height, left, -height * scale - bottom, this.width * scale, height * scale);
    }

    renderScaled(left: number, bottom: number, scale: number, context: CanvasRenderingContext2D) {
        context.drawImage(this.canvasImageSource, left, (1 - this.height) * scale - bottom, this.width * scale, this.height * scale);
    }

    withoutAlpha(): ImageObject {
        const canvas = ImageObject.createNewCanvas(this.width, this.height);
        const context = ImageObject.getCanvasRenderingContextFromCanvas(canvas, false);
        this.paintIntoContext(context);
        return new ImageObject(canvas, false);
    }

    private static createNewCanvas(width: number, height: number): HTMLCanvasElement {
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }

    private static getCanvasRenderingContextFromCanvas(canvas: HTMLCanvasElement, alpha: boolean): CanvasRenderingContext2D {
        const context = canvas.getContext('2d', { alpha });
        if (context == null) {
            throw new Error('Failed to create 2d context')
        }
        return context;
    }

    private createImage(): HTMLCanvasElement {
        return this.getOrCreateCanvasRenderingContext().canvas;
    }

    private createImageData(): ImageData {
        return this.getOrCreateCanvasRenderingContext().getImageData(0, 0, this.width, this.height);
    }

    private createCanvasRenderingContext(): CanvasRenderingContext2D {
        if (this._image != undefined && this._image instanceof HTMLCanvasElement) {
            return ImageObject.getCanvasRenderingContextFromCanvas(this._image, this.alpha);
        }
        const canvas: HTMLCanvasElement = ImageObject.createNewCanvas(this.width, this.height);
        const context = ImageObject.getCanvasRenderingContextFromCanvas(canvas, this.alpha);
        this.paintIntoContext(context);
        if (this._image == undefined) {
            this._image = canvas;
        }
        return context;
    }

    private getOrCreateCanvasRenderingContext(): CanvasRenderingContext2D {
        if (this._context == undefined) {
            this._context = this.createCanvasRenderingContext();
        }
        return this._context;
    }

    private isTransparent(): boolean {
        const data = this.imageData;
        for (let y = 0; y < data.height; ++y) {
            const i = y * data.width * 4;
            for (let x = 0; x < data.width; ++x) {
                if (data.data[i + x * 4 + 3]! < 255) {
                    return true;
                }
            }
        }
        return false;
    }

    private paintIntoContext(context: CanvasRenderingContext2D) {
        if (this._image != undefined) {
            context.drawImage(this._image, 0, 0);
        } else if (this._imageData != undefined) {
            context.putImageData(this._imageData, 0, 0);
        } else {
            throw new Error('Failed to paint into 2d context');
        }
    }
}