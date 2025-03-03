import { Color } from "../color";
import { ImageObject } from "./image-object";

export class ImageFactory {

	private constructor() {}

	static emptyImage(size: number): ImageObject {
		return this.checkerBoard(size, size, new Color(1, 0.5, 0.5), new Color(1, 1, 1, 0.5));
	}

	static checkerBoard(width: number, height: number, color1: Color, color2: Color): ImageObject {
		const ret = new ImageData(width, height);
		let i: number;
		const wh = width / 2;
		const hh = height / 2;
		for (let x = 0; x < width; ++x) {
			for (let y = 0; y < height; ++y) {
				i = (x + y * width) * 4;
				if ((x < wh && y < hh) || (x >= wh && y >= hh)) {
					ret.data[i] = Math.round(color1.r * 255);
					ret.data[i + 1] = Math.round(color1.g * 255);
					ret.data[i + 2] = Math.round(color1.b * 255);
					ret.data[i + 3] = Math.round(color1.a * 255);
				} else {
					ret.data[i] = Math.round(color2.r * 255);
					ret.data[i + 1] = Math.round(color2.g * 255);
					ret.data[i + 2] = Math.round(color2.b * 255);
					ret.data[i + 3] = Math.round(color2.a * 255);
				}
			}
		}
		return new ImageObject(ret, color1.a < 1 || color2.a < 1);
	}

	static noiseColor(width: number, height: number, alpha: boolean): ImageObject {
		const ret = new ImageData(width, height);
		let i: number;
		for (let x = 0; x < width; ++x) {
			for (let y = 0; y < height; ++y) {
				i = (x + y * width) * 4;
				ret.data[i] = Math.floor(Math.random() * 256);
				ret.data[i + 1] = Math.floor(Math.random() * 256);
				ret.data[i + 2] = Math.floor(Math.random() * 256);
				ret.data[i + 3] = alpha ? Math.floor(Math.random() * 256) : 255;
			}
		}
		return new ImageObject(ret, alpha);
	}

	static noiseBlackWhite(width: number, height: number, alpha: boolean): ImageObject {
		const ret = new ImageData(width, height);
		let i: number;
		let v: number;
		for (let x = 0; x < width; ++x) {
			for (let y = 0; y < height; ++y) {
				i = (x + y * width) * 4;
				v = Math.floor(Math.random() * 256);
				ret.data[i] = v;
				ret.data[i + 1] = v;
				ret.data[i + 2] = v;
				ret.data[i + 3] = alpha ? v : 255;
			}
		}
		return new ImageObject(ret, alpha);
	}
}