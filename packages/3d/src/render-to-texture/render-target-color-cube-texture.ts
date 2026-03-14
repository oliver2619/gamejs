import { ReadonlyVector2d, Vector2d } from "@pluto/core";
import { AbstractColorCubeTexture, TextureMipmapGenerator } from "../texture";
import { ColorRenderTargetCube } from "./render-target";
import { Context3d } from "../context";
import { Error3d } from "../error-3d";

export class RenderTargetColorCubeTexture extends AbstractColorCubeTexture implements ColorRenderTargetCube {

    readonly alpha = false;
    readonly viewportSize: ReadonlyVector2d;

    readonly size: number;

    constructor(context: Context3d, data: {
        anisotropy?: number,
        magFilter?: boolean,
        minFilter?: boolean,
        mipmaps?: TextureMipmapGenerator,
        size: number,
    }) {
        super(context, data);
        this.size = context.roundCubeTextureSize(data.size);
        this.viewportSize = new Vector2d(this.size, this.size);
        this.createInitialImage();
    }

    beginRenderingToCube(layer: number, activeFace: GLenum): void {
        Context3d.current.gl.framebufferTexture2D(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.COLOR_ATTACHMENT0 + layer, activeFace, this.texture, 0);
    }

    endRenderingToCube(layer: number): void {
        Context3d.current.gl.framebufferTexture2D(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.COLOR_ATTACHMENT0 + layer, WebGLRenderingContext.TEXTURE_2D, null, 0);
		this.setImageModified();
    }

    private createInitialImage() {
        const gl = this.context.gl;
        this.update(() => {
			Error3d.execute(() => {
				gl.texImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, WebGLRenderingContext.RGB, this.size, this.size, 0, WebGLRenderingContext.RGB, WebGLRenderingContext.UNSIGNED_BYTE, null);
				gl.texImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_X, 0, WebGLRenderingContext.RGB, this.size, this.size, 0, WebGLRenderingContext.RGB, WebGLRenderingContext.UNSIGNED_BYTE, null);
				gl.texImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, WebGLRenderingContext.RGB, this.size, this.size, 0, WebGLRenderingContext.RGB, WebGLRenderingContext.UNSIGNED_BYTE, null);
				gl.texImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, WebGLRenderingContext.RGB, this.size, this.size, 0, WebGLRenderingContext.RGB, WebGLRenderingContext.UNSIGNED_BYTE, null);
				gl.texImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, WebGLRenderingContext.RGB, this.size, this.size, 0, WebGLRenderingContext.RGB, WebGLRenderingContext.UNSIGNED_BYTE, null);
				gl.texImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, WebGLRenderingContext.RGB, this.size, this.size, 0, WebGLRenderingContext.RGB, WebGLRenderingContext.UNSIGNED_BYTE, null);
			}, gl, () => 'Failed to initialize render target color cube texture.');
		});
    }
}