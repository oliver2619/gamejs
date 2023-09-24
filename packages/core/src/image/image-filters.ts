import { Vector3 } from "../math/vector3";

export class ImageFilters {

    static bump(height: number, distance: number): (img: HTMLImageElement | HTMLCanvasElement | ImageData, alpha: boolean) => ImageData {
        return (img: HTMLImageElement | HTMLCanvasElement | ImageData, alpha: boolean) => {
            distance = Math.max(1, Math.round(distance));
            const imgData = this.imageToImageData(img, alpha);
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

    public static flipY(): (img: HTMLImageElement | HTMLCanvasElement | ImageData, alpha: boolean) => ImageData {
        return (img: HTMLImageElement | HTMLCanvasElement | ImageData, alpha: boolean) => {
            const imgData = this.imageToImageData(img, alpha);
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

    private static imageToImageData(img: HTMLImageElement | HTMLCanvasElement | ImageData, alpha: boolean): ImageData {
        if (img instanceof ImageData)
            return img;
        else if (img instanceof HTMLImageElement) {
            const canvas: HTMLCanvasElement = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const context = canvas.getContext('2d', { alpha });
            if (context == null) {
                throw new Error('Failed to create 2d context')
            }
            context.drawImage(img, 0, 0);
            return context.getImageData(0, 0, img.width, img.height);
        } else {
            const context = img.getContext('2d', { alpha });
            if (context == null) {
                throw new Error('Failed to create 2d context')
            }
            return context.getImageData(0, 0, img.width, img.height);
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
