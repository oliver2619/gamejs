import { ReadonlyVector2d } from "@pluto/core";
import { RenderBuffer } from "./render-buffer";
import { DepthRenderTarget2d, DepthRenderTargetCube } from "./render-target";
import { Context3d } from "../context";
import { Error3d } from "../error-3d";

export class DepthRenderBuffer extends RenderBuffer implements DepthRenderTarget2d, DepthRenderTargetCube {

    constructor(data: {
        gl: WebGLRenderingContext,
        size: ReadonlyVector2d,
    }) {
        super(data);
        this.update(data.gl, () => {
            Error3d.execute(() => {
                data.gl.renderbufferStorage(WebGLRenderingContext.RENDERBUFFER, WebGLRenderingContext.DEPTH_STENCIL, data.size.x, data.size.y);
            }, data.gl, () => 'Failed to create depth render buffer storage.');
        });
    }

    beginRenderingTo2d(): void {
        const gl = Context3d.current.gl;
        gl.bindRenderbuffer(WebGLRenderingContext.RENDERBUFFER, this._renderBuffer);
        gl.framebufferRenderbuffer(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.DEPTH_STENCIL_ATTACHMENT, WebGLRenderingContext.RENDERBUFFER, this._renderBuffer);
    }

    endRenderingTo2d(): void {
        const gl = Context3d.current.gl;
        gl.framebufferRenderbuffer(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.DEPTH_STENCIL_ATTACHMENT, WebGLRenderingContext.RENDERBUFFER, null);
        gl.bindRenderbuffer(WebGLRenderingContext.RENDERBUFFER, null);
    }

    beginRenderingToCube(_activeFace: GLenum): void {
        const gl = Context3d.current.gl;
        gl.bindRenderbuffer(WebGLRenderingContext.RENDERBUFFER, this._renderBuffer);
        gl.framebufferRenderbuffer(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.DEPTH_STENCIL_ATTACHMENT, WebGLRenderingContext.RENDERBUFFER, this._renderBuffer);
    }

    endRenderingToCube(): void {
        const gl = Context3d.current.gl;
        gl.framebufferRenderbuffer(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.DEPTH_STENCIL_ATTACHMENT, WebGLRenderingContext.RENDERBUFFER, null);
        gl.bindRenderbuffer(WebGLRenderingContext.RENDERBUFFER, null);
    }
}