import { ReadonlyVector2d, Vector2d } from "@pluto/core";
import { Texture2d } from "../texture";
import { DepthRenderTarget2d } from "./render-target";
import { Context3d } from "../context";
import { Error3d } from "../error-3d";
import { AbstractDepthTexture } from "../texture/abstract-depth-texture";

export class RenderTargetDepthTexture2d extends AbstractDepthTexture implements Texture2d, DepthRenderTarget2d {

    readonly dimension = 2;

    readonly size: ReadonlyVector2d;
    readonly viewportSize: ReadonlyVector2d;

    constructor(context: Context3d, data: {
        size: ReadonlyVector2d,
        stencil: boolean,
    }) {
        super(context, WebGLRenderingContext.TEXTURE_2D, data.stencil);
        this.viewportSize = context.roundTexture2dSize(data.size);
        this.size = this.viewportSize;
        this.createInitialImage();
    }

    beginRenderingTo2d(): void {
        Context3d.current.gl.framebufferTexture2D(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.DEPTH_ATTACHMENT, WebGLRenderingContext.TEXTURE_2D, this.texture, 0);
        if (this.stencil) {
            Context3d.current.gl.framebufferTexture2D(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.STENCIL_ATTACHMENT, WebGLRenderingContext.TEXTURE_2D, this.texture, 0);
        }
    }

    endRenderingTo2d(): void {
        Context3d.current.gl.framebufferTexture2D(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.DEPTH_ATTACHMENT, WebGLRenderingContext.TEXTURE_2D, null, 0);
        if (this.stencil) {
            Context3d.current.gl.framebufferTexture2D(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.STENCIL_ATTACHMENT, WebGLRenderingContext.TEXTURE_2D, null, 0);
        }
    }

    private createInitialImage() {
        const gl = this.context.gl;
        this.update(() => {
            Error3d.execute(() => {
                // gl.texImage2D(this.target, 0, WebGLRenderingContext.DEPTH_COMPONENT16, this.size.x, this.size.y, 0, WebGLRenderingContext.DEPTH_COMPONENT, WebGLRenderingContext.UNSIGNED_SHORT, null);
                // TODO use depth_COMPONENT24 or 32 if no stencil
                gl.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, 35056, this.size.x, this.size.y, 0, WebGLRenderingContext.DEPTH_STENCIL, 0x84FA, null);

            }, gl, () => 'Failed to create render target depth texture.');
        });
    }

    protected override applyParameters(): void {
        const gl = this.context.gl;
        gl.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGLRenderingContext.TEXTURE_WRAP_S, WebGLRenderingContext.CLAMP_TO_EDGE);
        gl.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGLRenderingContext.TEXTURE_WRAP_T, WebGLRenderingContext.CLAMP_TO_EDGE);
        gl.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGLRenderingContext.TEXTURE_MAG_FILTER, WebGLRenderingContext.NEAREST);
        gl.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGLRenderingContext.TEXTURE_MIN_FILTER, WebGLRenderingContext.NEAREST);
    }

}