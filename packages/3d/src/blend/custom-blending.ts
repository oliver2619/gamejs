import { Context3d } from "../context";
import { Blending } from "./blending";

export class CustomBlending implements Blending {

	readonly supportsLighting = false;
	readonly transparent: boolean;

	constructor(private readonly srcFactor: GLenum, private readonly dstFactor: GLenum, private readonly equation: GLenum) {
		this.transparent = this._isTransparent(srcFactor, dstFactor);
	}

	use(): void {
		Context3d.current.gl.blendEquation(this.equation);
		Context3d.current.gl.blendFunc(this.srcFactor, this.dstFactor);
	}

	private _isTransparent(srcFactor: GLenum, dstFactor: GLenum): boolean {
		if (dstFactor !== WebGLRenderingContext.ZERO) {
			return true;
		}
		return srcFactor === WebGLRenderingContext.DST_COLOR || srcFactor === WebGLRenderingContext.ONE_MINUS_DST_COLOR
			|| srcFactor === WebGLRenderingContext.DST_ALPHA || srcFactor === WebGLRenderingContext.ONE_MINUS_DST_ALPHA
			|| srcFactor === WebGLRenderingContext.SRC_ALPHA_SATURATE;
	}
}