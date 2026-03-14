import { Context3d } from "../context";
import { Blending } from "./blending";

export class SubtractiveBlending implements Blending {

	static readonly SUBTRACT = new SubtractiveBlending(WebGLRenderingContext.ONE);
	static readonly SUBTRACT_ALPHA = new SubtractiveBlending(WebGLRenderingContext.SRC_ALPHA);

	readonly supportsLighting = false;
	readonly transparent = true;

	private constructor(private readonly srcFactor: GLenum) { }

	use(): void {
		Context3d.current.gl.blendEquation(WebGLRenderingContext.FUNC_REVERSE_SUBTRACT);
		Context3d.current.gl.blendFunc(this.srcFactor, WebGLRenderingContext.ONE);
	}
}