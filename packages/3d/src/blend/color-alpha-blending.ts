import { Color, ReadonlyColor } from "@pluto/core";
import { Blending } from "./blending";
import { Context3d } from "../context";

export class ColorAlphaBlending implements Blending {

	readonly supportsLighting = true;
	readonly transparent: boolean;

	private readonly color: Color;

	constructor(color: ReadonlyColor) {
		this.color = color.clone();
		this.transparent = this.color.isBlack;
	}

	use(): void {
		Context3d.current.gl.blendEquation(WebGLRenderingContext.FUNC_ADD);
		Context3d.current.gl.blendColor(this.color.r, this.color.g, this.color.b, this.color.a);
		Context3d.current.gl.blendFunc(WebGLRenderingContext.ONE, WebGLRenderingContext.CONSTANT_COLOR);
	}
}