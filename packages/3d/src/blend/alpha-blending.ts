import { Context3d } from "../context";
import { Blending } from "./blending";

export class AlphaBlending implements Blending {

    static readonly ALPHA = new AlphaBlending(WebGLRenderingContext.SRC_ALPHA, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA);
    static readonly INVERSE_ALPHA = new AlphaBlending(WebGLRenderingContext.ONE_MINUS_SRC_ALPHA, WebGLRenderingContext.SRC_ALPHA);

    readonly supportsLighting = true;
    readonly transparent = true;

    private constructor(private readonly srcFactor: GLenum, private readonly dstFactor: GLenum) { }

    use(): void {
        Context3d.current.gl.blendEquation(WebGLRenderingContext.FUNC_ADD);
        Context3d.current.gl.blendFunc(this.srcFactor, this.dstFactor);
    }
}