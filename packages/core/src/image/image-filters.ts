import {Vector3} from "../math/vector3";

export class ImageFilters {

    static bump(height: number, distance: number): (img: HTMLImageElement | HTMLCanvasElement | ImageData, alpha: boolean) => ImageData {
        return (img: HTMLImageElement | HTMLCanvasElement | ImageData, alpha: boolean) => {
            distance = Math.max(1, Math.round(distance));
            const imgData = this.toImageData(img, alpha);
            const target = new ImageData(img.width, img.height);
            let i: number;
            let dz: number;
            let z0: number;
            let v: Vector3;
            let n: Vector3;
            for (let x = 0; x < img.width; ++x) {
                for (let y = 0; y < img.height; ++y) {
                    i = this.getPixelIndex(x, y, imgData);
                    z0 = ImageFilters.colorToValue(imgData.data, i, alpha);
                    v = new Vector3(0, 0, 0);
                    for (let dx = -distance; dx <= distance; ++dx) {
                        for (let dy = -distance; dy <= distance; ++dy) {
                            i = this.getPixelIndex(x + dx, y - dy, imgData);
                            dz = (ImageFilters.colorToValue(imgData.data, i, alpha) - z0) * height;
                            n = new Vector3(-dx * dz, -dy * dz, dx * dx + dy * dy);
                            n.normalize();
                            v.add(n);
                        }
                    }
                    v.normalize();
                    i = this.getPixelIndex(x, y, imgData);
                    target.data[i] = this.bumpValueToColor(v.x);
                    target.data[i + 1] = this.bumpValueToColor(v.y);
                    target.data[i + 2] = this.bumpValueToColor(v.z);
                    target.data[i + 3] = imgData.data[i + 3];
                }
            }
            return target;
        };
    }

    static flipY(): (img: HTMLImageElement | HTMLCanvasElement | ImageData, alpha: boolean) => ImageData {
        return (img: HTMLImageElement | HTMLCanvasElement | ImageData, alpha: boolean) => {
            const imgData = this.toImageData(img, alpha);
            const target = new ImageData(img.width, img.height);
            let i1: number, i2: number;
            for (let y = 0; y < img.height; ++y) {
                i1 = this.getPixelIndex(0, y, imgData);
                i2 = this.getPixelIndex(0, img.height - y - 1, imgData);
                for (let x = 0; x < img.width; ++x) {
                    target.data[i1 + x * 4] = imgData.data[i2 + x * 4];
                    target.data[i1 + x * 4 + 1] = imgData.data[i2 + x * 4 + 1];
                    target.data[i1 + x * 4 + 2] = imgData.data[i2 + x * 4 + 2];
                    target.data[i1 + x * 4 + 3] = imgData.data[i2 + x * 4 + 3];
                }
            }
            return target;
        };
    }

    static isTransparent(src: HTMLImageElement): boolean {
        const data = this.toImageData(src, true);
        for (let y = 0; y < data.height; ++y) {
            const i = y * src.width * 4;
            for (let x = 0; x < data.width; ++x) {
                if (data.data[i + x * 4 + 3] < 255) {
                    return true;
                }
            }
        }
        return false;
    }

    static toRenderingContext(img: HTMLImageElement | ImageData, alpha: boolean): CanvasRenderingContext2D {
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const context = canvas.getContext('2d', {alpha});
        if (context == null) {
            throw new Error('Failed to create 2d context')
        }
        if (img instanceof ImageData) {
            context.putImageData(img, 0, 0);
        } else {
            context.drawImage(img, 0, 0);
        }
        return context;
    }

    static removeAlphaFromImage(img: HTMLImageElement): CanvasRenderingContext2D {
        return this.toRenderingContext(img, false);
    }

    static toImageData(src: HTMLImageElement | HTMLCanvasElement | ImageData | CanvasRenderingContext2D, alpha: boolean): ImageData {
        if (src instanceof ImageData)
            return src;
        else if (src instanceof HTMLImageElement) {
            return this.toRenderingContext(src, alpha).getImageData(0, 0, src.width, src.height);
        } else if (src instanceof HTMLCanvasElement) {
            const context = src.getContext('2d', {alpha});
            if (context == null) {
                throw new Error('Failed to create 2d context')
            }
            return context.getImageData(0, 0, src.width, src.height);
        } else {
            return src.getImageData(0, 0, src.canvas.width, src.canvas.height);
        }
    }

    static toImage(src: ImageData | CanvasRenderingContext2D, alpha: boolean): HTMLImageElement {
        if (src instanceof ImageData) {
            const context = this.toRenderingContext(src, alpha);
            const ret = new Image(src.width, src.height);
            ret.src = context.canvas.toDataURL();
            return ret;
        } else {
            const ret = new Image(src.canvas.width, src.canvas.height);
            ret.src = src.canvas.toDataURL();
            return ret;
        }
    }

    private static bumpValueToColor(b: number): number {
        return Math.round((b + 1) * 255 / 2);
    }

    private static colorToValue(imageData: Uint8ClampedArray, index: number, useAlpha: boolean): number {
        return useAlpha ? imageData[index + 3] : imageData[index];
    }

    private static getPixelIndex(x: number, y: number, imgData: ImageData): number {
        const cx = (x + imgData.width) % imgData.width;
        const cy = (y + imgData.height) % imgData.height;
        return (cx + cy * imgData.width) * 4;
    }
}
