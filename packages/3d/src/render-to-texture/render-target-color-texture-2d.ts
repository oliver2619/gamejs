import { ReadonlyVector2d, Vector2d } from "@pluto/core";
import { AbstractColorTexture2d,  TextureMipmapGenerator, TextureWrap } from "../texture";
import { Context3d } from "../context";
import { ColorRenderTarget2d } from "./render-target";
import { Error3d } from "../error-3d";

export class RenderTargetColorTexture2d extends AbstractColorTexture2d implements ColorRenderTarget2d {

    readonly alpha: boolean;
    readonly hdr: boolean;
    readonly viewportSize: ReadonlyVector2d;
    readonly size: ReadonlyVector2d;

    constructor(context: Context3d, data: {
        alpha?: boolean,
        anisotropy?: number,
        hdr?: boolean,
        magFilter?: boolean,
        minFilter?: boolean,
        mipmaps?: TextureMipmapGenerator,
        physicalSize?: ReadonlyVector2d,
        size: ReadonlyVector2d,
        wrapS?: TextureWrap,
        wrapT?: TextureWrap,
    }) {
        super(context, {
            ...data,
            wrapS: data.wrapS ?? TextureWrap.CLAMP,
            wrapT: data.wrapT ?? TextureWrap.CLAMP,
        });
        const hdr = context.gl instanceof WebGL2RenderingContext && data.hdr === true;
        // only RGBA is color renderable using hdr, RGB is not
        this.alpha = hdr || data.alpha === true;
        this.hdr = hdr;
        this.viewportSize = context.roundTexture2dSize(data.size);
        this.size = this.viewportSize;
        this.createInitialImage();
    }

    beginRenderingTo2d(layer: number): void {
        this.context.gl.framebufferTexture2D(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.COLOR_ATTACHMENT0 + layer, WebGLRenderingContext.TEXTURE_2D, this.texture, 0);
    }

    endRenderingTo2d(layer: number): void {
        this.context.gl.framebufferTexture2D(WebGLRenderingContext.FRAMEBUFFER, WebGLRenderingContext.COLOR_ATTACHMENT0 + layer, WebGLRenderingContext.TEXTURE_2D, null, 0);
        this.setImageModified();
    }

    private createInitialImage() {
        const format = this.alpha ? (this.hdr ? WebGLRenderingContext.RGBA : WebGLRenderingContext.RGBA) : (this.hdr ? WebGLRenderingContext.RGB : WebGLRenderingContext.RGB);
        const internalFormat = this.alpha ? (this.hdr ? WebGL2RenderingContext.RGBA32F : WebGLRenderingContext.RGBA) : (this.hdr ? WebGL2RenderingContext.RGB32F : WebGLRenderingContext.RGB);
        const gl = this.context.gl;
        this.update(() => {
            Error3d.execute(() => {
                gl.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, internalFormat, this.viewportSize.x, this.viewportSize.y, 0, format, this.hdr ? WebGLRenderingContext.FLOAT : WebGLRenderingContext.UNSIGNED_BYTE, null);
            }, gl, () => 'Failed to initialize render target color texture.');
        });
    }
}