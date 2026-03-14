import { ReadonlyVector2d } from "@pluto/core";
import { RenderBuffer } from "./render-buffer";
import { ColorRenderTarget2d, ColorRenderTargetCube } from "./render-target";
import { Error3d } from "../error-3d";
import { Context3d } from "../context";

export class ColorRenderBuffer extends RenderBuffer implements ColorRenderTarget2d, ColorRenderTargetCube {

    readonly hdr: boolean;

    constructor(data: {
        gl: WebGLRenderingContext,
        size: ReadonlyVector2d,
        multisample: number,
        hdr: boolean,
    }) {
        super(data);
        this.hdr = data.hdr;
        this.update(data.gl, () => {
            Error3d.execute(() => {
                if (data.gl instanceof WebGL2RenderingContext) {
                    if (data.multisample > 1) {
                        data.gl.renderbufferStorageMultisample(WebGLRenderingContext.RENDERBUFFER, data.multisample, this.hdr ? WebGL2RenderingContext.RGBA32F : WebGLRenderingContext.RGBA8, data.size.x, data.size.y);
                    } else {
                        data.gl.renderbufferStorage(WebGLRenderingContext.RENDERBUFFER, data.hdr ? WebGL2RenderingContext.RGBA32F : WebGLRenderingContext.RGBA8, data.size.x, data.size.y);
                    }
                } else {
                    data.gl.renderbufferStorage(WebGLRenderingContext.RENDERBUFFER, WebGLRenderingContext.RGBA8, data.size.x, data.size.y);
                }
            }, data.gl, () => 'Failed to create color render buffer storage');
        });
    }

    beginRenderingTo2d(layer: number): void {
        const gl = Context3d.current.gl;
        gl.bindRenderbuffer(WebGLRenderingContext.RENDERBUFFER, this._renderBuffer);
        gl.framebufferRenderbuffer(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.COLOR_ATTACHMENT0 + layer, WebGLRenderingContext.RENDERBUFFER, this._renderBuffer);
    }

    endRenderingTo2d(layer: number): void {
        const gl = Context3d.current.gl;
        gl.framebufferRenderbuffer(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.COLOR_ATTACHMENT0 + layer, WebGLRenderingContext.RENDERBUFFER, null);
        gl.bindRenderbuffer(WebGLRenderingContext.RENDERBUFFER, null);
    }

    beginRenderingToCube(layer: number, _activeFace: GLenum): void {
        const gl = Context3d.current.gl;
        gl.bindRenderbuffer(WebGLRenderingContext.RENDERBUFFER, this._renderBuffer);
        gl.framebufferRenderbuffer(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.COLOR_ATTACHMENT0 + layer, WebGLRenderingContext.RENDERBUFFER, this._renderBuffer);
    }

    endRenderingToCube(layer: number): void {
        const gl = Context3d.current.gl;
        gl.framebufferRenderbuffer(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.COLOR_ATTACHMENT0 + layer, WebGLRenderingContext.RENDERBUFFER, null);
        gl.bindRenderbuffer(WebGLRenderingContext.RENDERBUFFER, null);
    }
}