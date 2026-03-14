import { Context3d } from "../context";
import { Blending } from "./blending";

export class NoBlending implements Blending {

	static readonly NONE = new NoBlending(WebGLRenderingContext.ONE, WebGLRenderingContext.ZERO);
	static readonly ALPHA_BINARY = new NoBlending(WebGLRenderingContext.SRC_ALPHA, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA);
	static readonly INVERSE_ALPHA_BINARY = new NoBlending(WebGLRenderingContext.ONE_MINUS_SRC_ALPHA, WebGLRenderingContext.SRC_ALPHA);

	private constructor(private readonly srcFactor: GLenum, private readonly dstFactor: GLenum) { }

	readonly supportsLighting = true;
	readonly transparent = false;

	use(): void {
		Context3d.current.gl.blendEquation(WebGLRenderingContext.FUNC_ADD);
		Context3d.current.gl.blendFunc(this.srcFactor, this.dstFactor);
	}
}