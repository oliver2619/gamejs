import { Context3d } from "../context";
import { AbstractColorTexture } from "./abstract-color-texture";
import { CubeTexture, TextureMipmapGenerator } from "./texture";

export abstract class AbstractColorCubeTexture extends AbstractColorTexture implements CubeTexture {

    abstract readonly size: number;

    readonly dimension = 3;

    protected constructor(context: Context3d, data: {
        anisotropy?: number| undefined,
        magFilter?: boolean| undefined,
        minFilter?: boolean| undefined,
        mipmaps?: TextureMipmapGenerator| undefined,
    }) {
        super(context, WebGLRenderingContext.TEXTURE_CUBE_MAP, data);
    }

    protected override applyParameters(): void {
        super.applyParameters();
        this.context.gl.texParameteri(WebGLRenderingContext.TEXTURE_CUBE_MAP, WebGLRenderingContext.TEXTURE_WRAP_S, WebGLRenderingContext.CLAMP_TO_EDGE);
        this.context.gl.texParameteri(WebGLRenderingContext.TEXTURE_CUBE_MAP, WebGLRenderingContext.TEXTURE_WRAP_T, WebGLRenderingContext.CLAMP_TO_EDGE);
        this.context.gl.texParameteri(WebGLRenderingContext.TEXTURE_CUBE_MAP, WebGL2RenderingContext.TEXTURE_WRAP_R, WebGLRenderingContext.CLAMP_TO_EDGE);
    }
}