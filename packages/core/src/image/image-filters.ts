import { Color } from "../color";
import { Vector3d } from "../math/vector-3d";
import { ImageObject } from "./image-object";

export type ImageFilter = (input: ImageObject) => ImageObject;

export class ImageFilters {

    static bump(height: number, distance: number): ImageFilter {
        return (img: ImageObject) => {
            distance = Math.max(1, Math.round(distance));
            const imgData = img.imageData;
            const target = new ImageData(img.width, img.height);
            let i: number;
            let dz: number;
            let z0: number;
            let v: Vector3d;
            let n: Vector3d;
            for (let x = 0; x < img.width; ++x) {
                for (let y = 0; y < img.height; ++y) {
                    i = this.getPixelIndex(x, y, imgData);
                    z0 = ImageFilters.colorToValue(imgData.data, i, img.alpha);
                    v = new Vector3d(0, 0, 0);
                    for (let dx = -distance; dx <= distance; ++dx) {
                        for (let dy = -distance; dy <= distance; ++dy) {
                            i = this.getPixelIndex(x + dx, y - dy, imgData);
                            dz = (ImageFilters.colorToValue(imgData.data, i, img.alpha) - z0) * height;
                            n = new Vector3d(-dx * dz, -dy * dz, dx * dx + dy * dy);
                            n.normalize();
                            v.add(n);
                        }
                    }
                    v.normalize();
                    i = this.getPixelIndex(x, y, imgData);
                    target.data[i] = this.bumpValueToColor(v.x);
                    target.data[i + 1] = this.bumpValueToColor(v.y);
                    target.data[i + 2] = this.bumpValueToColor(v.z);
                    target.data[i + 3] = imgData.data[i + 3]!;
                }
            }
            return new ImageObject(target, img.alpha);
        };
    }

    static colorMapping(mapping: (c: Color) => Color): ImageFilter {
        return (img: ImageObject) => {
            const imgData = img.imageData.data;
            const target = new ImageData(img.width, img.height);
            let alpha = false;
            for (let y = 0; y < img.height; ++y) {
                for (let x = 0; x < img.width; ++x) {
                    const i = (x + y * img.width) * 4;
                    const c = mapping(new Color(imgData[i]! / 255, imgData[i + 1]! / 255, imgData[i + 2]! / 255, img.alpha ? imgData[i + 3]! / 255 : 1));
                    target.data[i] = ImageFilters.floatToUint8(c.r);
                    target.data[i + 1] = ImageFilters.floatToUint8(c.g);
                    target.data[i + 2] = ImageFilters.floatToUint8(c.b);
                    const a = ImageFilters.floatToUint8(c.a);
                    target.data[i + 3] = a;
                    if (a < 255) {
                        alpha = true;
                    }
                }
            }
            return new ImageObject(target, alpha);
        };
    }

    static flipY(): ImageFilter {
        return (img: ImageObject) => {
            const imgData = img.imageData;
            const target = new ImageData(img.width, img.height);
            let i1: number, i2: number;
            for (let y = 0; y < img.height; ++y) {
                i1 = this.getPixelIndex(0, y, imgData);
                i2 = this.getPixelIndex(0, img.height - y - 1, imgData);
                for (let x = 0; x < img.width; ++x) {
                    target.data[i1 + x * 4] = imgData.data[i2 + x * 4]!;
                    target.data[i1 + x * 4 + 1] = imgData.data[i2 + x * 4 + 1]!;
                    target.data[i1 + x * 4 + 2] = imgData.data[i2 + x * 4 + 2]!;
                    target.data[i1 + x * 4 + 3] = imgData.data[i2 + x * 4 + 3]!;
                }
            }
            return new ImageObject(target, img.alpha);
        };
    }

    static removeAlpha(): ImageFilter {
        return (img: ImageObject) => img.withoutAlpha();
    }

    private static bumpValueToColor(b: number): number {
        return Math.round((b + 1) * 255 / 2);
    }

    private static colorToValue(imageData: Uint8ClampedArray, index: number, useAlpha: boolean): number {
        return useAlpha ? imageData[index + 3]! : imageData[index]!;
    }

    private static floatToUint8(input: number): number {
        return Math.min(255, Math.max(0, Math.round(input * 255)));
    }

    private static getPixelIndex(x: number, y: number, imgData: ImageData): number {
        const cx = (x + imgData.width) % imgData.width;
        const cy = (y + imgData.height) % imgData.height;
        return (cx + cy * imgData.width) * 4;
    }
}
