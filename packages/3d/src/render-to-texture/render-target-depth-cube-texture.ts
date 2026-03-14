import { ReadonlyVector2d, Vector2d } from "@pluto/core";
import { CubeTexture } from "../texture";
import { AbstractDepthTexture } from "../texture/abstract-depth-texture";
import { DepthRenderTargetCube } from "./render-target";
import { Context3d } from "../context";
import { Error3d } from "../error-3d";

export class RenderTargetDepthCubeTexture extends AbstractDepthTexture implements CubeTexture, DepthRenderTargetCube {

    readonly dimension = 3;
    readonly size: number;
    readonly viewportSize: ReadonlyVector2d;

    constructor(context: Context3d, data: {
        size: number,
    }) {
        super(context, WebGLRenderingContext.TEXTURE_CUBE_MAP, false);
        this.size = context.roundCubeTextureSize(data.size);
        this.viewportSize = new Vector2d(this.size, this.size);
        this.createInitialImage();
    }

    beginRenderingToCube(activeFace: GLenum): void {
        Context3d.current.gl.framebufferTexture2D(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.DEPTH_ATTACHMENT, activeFace, this.texture, 0);
    }

    endRenderingToCube(): void {
        Context3d.current.gl.framebufferTexture2D(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.DEPTH_ATTACHMENT, WebGLRenderingContext.TEXTURE_2D, null, 0);
    }

    protected override applyParameters(): void {
        this.context.gl.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGLRenderingContext.TEXTURE_WRAP_S, WebGLRenderingContext.CLAMP_TO_EDGE);
        this.context.gl.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGLRenderingContext.TEXTURE_WRAP_T, WebGLRenderingContext.CLAMP_TO_EDGE);
        this.context.gl.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_R, WebGLRenderingContext.CLAMP_TO_EDGE);
        this.context.gl.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGLRenderingContext.TEXTURE_MAG_FILTER, WebGLRenderingContext.NEAREST);
        this.context.gl.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGLRenderingContext.TEXTURE_MIN_FILTER, WebGLRenderingContext.NEAREST);
    }

    private createInitialImage() {
        const gl = this.context.gl;
        this.update(() => {
            Error3d.execute(() => {
                gl.texImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, WebGLRenderingContext.DEPTH_COMPONENT, this.size, this.size, 0, WebGLRenderingContext.DEPTH_COMPONENT, WebGLRenderingContext.UNSIGNED_INT, null);
                gl.texImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_X, 0, WebGLRenderingContext.DEPTH_COMPONENT, this.size, this.size, 0, WebGLRenderingContext.DEPTH_COMPONENT, WebGLRenderingContext.UNSIGNED_INT, null);
                gl.texImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, WebGLRenderingContext.DEPTH_COMPONENT, this.size, this.size, 0, WebGLRenderingContext.DEPTH_COMPONENT, WebGLRenderingContext.UNSIGNED_INT, null);
                gl.texImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, WebGLRenderingContext.DEPTH_COMPONENT, this.size, this.size, 0, WebGLRenderingContext.DEPTH_COMPONENT, WebGLRenderingContext.UNSIGNED_INT, null);
                gl.texImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, WebGLRenderingContext.DEPTH_COMPONENT, this.size, this.size, 0, WebGLRenderingContext.DEPTH_COMPONENT, WebGLRenderingContext.UNSIGNED_INT, null);
                gl.texImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, WebGLRenderingContext.DEPTH_COMPONENT, this.size, this.size, 0, WebGLRenderingContext.DEPTH_COMPONENT, WebGLRenderingContext.UNSIGNED_INT, null);
            }, gl, () => 'Failed to create render target depth texture.');
        });
    }
}