import { Color } from "../color";

export class ImageFactory {

	private static _emptyTexture: ImageData;

	static checkerBoard(width: number, height: number, color1: Color, color2: Color): ImageData {
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
		return ret;
	}

	static emptyTexture(): ImageData {
		if (this._emptyTexture === undefined) {
			const width = 4;
			const height = 4;
			this._emptyTexture = new ImageData(width, height);
			let i: number;
			for (let x = 0; x < width; ++x) {
				for (let y = 0; y < height; ++y) {
					i = (x + y * width) * 4;
					this._emptyTexture.data[i] = 128;
					this._emptyTexture.data[i + 1] = 128;
					this._emptyTexture.data[i + 2] = 128;
					this._emptyTexture.data[i + 3] = 255;
				}
			}
		}
		return this._emptyTexture;
	}

	static noiseColor(width: number, height: number): ImageData {
		const ret = new ImageData(width, height);
		let i: number;
		for (let x = 0; x < width; ++x) {
			for (let y = 0; y < height; ++y) {
				i = (x + y * width) * 4;
				ret.data[i] = Math.floor(Math.random() * 256);
				ret.data[i + 1] = Math.floor(Math.random() * 256);
				ret.data[i + 2] = Math.floor(Math.random() * 256);
				ret.data[i + 3] = Math.floor(Math.random() * 256);
			}
		}
		return ret;
	}

	static noiseBlackWhite(width: number, height: number): ImageData {
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
				ret.data[i + 3] = v;
			}
		}
		return ret;
	}
}