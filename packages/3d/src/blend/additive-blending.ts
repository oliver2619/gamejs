import { Context3d } from "../context";
import { Blending } from "./blending";

export class AdditiveBlending implements Blending {

    static readonly ADD = new AdditiveBlending(WebGLRenderingContext.ONE);
	static readonly ADD_ALPHA = new AdditiveBlending(WebGLRenderingContext.SRC_ALPHA);

	readonly supportsLighting = false;
	readonly transparent = true;

	private constructor(private readonly srcFactor: GLenum) { }

	use(): void {
        Context3d.current.gl.blendEquation(WebGLRenderingContext.FUNC_ADD);
		Context3d.current.gl.blendFunc(this.srcFactor, WebGLRenderingContext.ONE);
	}
}