import { Context3d } from "../context";
import { Blending } from "./blending";

export class MultiplicativeBlending implements Blending {

	static readonly MULTIPLY = new MultiplicativeBlending(WebGLRenderingContext.SRC_COLOR);
	static readonly MULTIPLY_ALPHA = new MultiplicativeBlending(WebGLRenderingContext.SRC_ALPHA);
	static readonly MULTIPLY_INVERSE = new MultiplicativeBlending(WebGLRenderingContext.ONE_MINUS_SRC_COLOR);
	static readonly MULTIPLY_INVERSE_ALPHA = new MultiplicativeBlending(WebGLRenderingContext.ONE_MINUS_SRC_ALPHA);

	readonly supportsLighting = false;
	readonly transparent = true;

	private constructor(private readonly dstFactor: GLenum) { }

	use(): void {
		Context3d.current.gl.blendEquation(WebGLRenderingContext.FUNC_ADD);
		Context3d.current.gl.blendFunc(WebGLRenderingContext.ZERO, this.dstFactor);
	}
}