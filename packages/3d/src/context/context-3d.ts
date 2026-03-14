import { ReadonlyVector2d, Vector2d } from "@pluto/core";
import { ShaderPrecision } from "../shader";
import { RenderToTexture } from "../render-to-texture/render-to-texture";

let current: Context3d | undefined;

export interface Context3dInitData {
    antialias: boolean,
    shaderPrecision: ShaderPrecision,
}
export abstract class Context3d {

    readonly antialias: boolean;
    readonly colorBufferFloatSupported: boolean;
    readonly maxRenderBufferSize: number;
    readonly maxCubeTextureSize: number;
    readonly maxColorAttachments: number;
    readonly maxDrawBuffers: number;
    readonly maxSamples: number;
    readonly maxTextureLayers: number;
    readonly maxTexture2dSize: number;
    readonly shaderPrecision: ShaderPrecision;
    readonly textureFloatLinearSupported: boolean;

    private readonly maxTextureAnisotropy: number;
    private readonly TEXTURE_MAX_ANISOTROPY: number;

    private readonly renderToTexture: RenderToTexture;

    static get current(): Context3d {
        if (current == undefined) {
            throw new Error('There is no active context.');
        }
        return current;
    }

    get canvasSize(): Vector2d {
        return new Vector2d(this.gl.canvas.width, this.gl.canvas.height);
    }

    constructor(readonly gl: WebGL2RenderingContext, data: Context3dInitData) {
        this.antialias = data.antialias;
        this.shaderPrecision = data.shaderPrecision;
        this.colorBufferFloatSupported = gl.getExtension('EXT_color_buffer_float') !== null;
        this.maxTexture2dSize = gl.getParameter(WebGLRenderingContext.MAX_TEXTURE_SIZE);
        this.maxRenderBufferSize = gl.getParameter(WebGLRenderingContext.MAX_RENDERBUFFER_SIZE);
        this.maxCubeTextureSize = gl.getParameter(WebGLRenderingContext.MAX_CUBE_MAP_TEXTURE_SIZE);
        this.maxColorAttachments = gl.getParameter(WebGL2RenderingContext.MAX_COLOR_ATTACHMENTS);
        this.maxDrawBuffers = gl.getParameter(WebGL2RenderingContext.MAX_DRAW_BUFFERS);
        this.maxSamples = gl.getParameter(WebGL2RenderingContext.MAX_SAMPLES);
        this.maxTextureLayers = gl.getParameter(WebGLRenderingContext.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
        this.textureFloatLinearSupported = gl.getExtension('OES_texture_float_linear') !== null;
        const extAnisotropic = gl.getExtension('EXT_texture_filter_anisotropic');
        if (extAnisotropic != null) {
            this.maxTextureAnisotropy = gl.getParameter(extAnisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
            this.TEXTURE_MAX_ANISOTROPY = extAnisotropic.TEXTURE_MAX_ANISOTROPY_EXT
        } else {
            this.maxTextureAnisotropy = 0;
            this.TEXTURE_MAX_ANISOTROPY = 0;
        }
        this.renderToTexture = new RenderToTexture(this);
        gl.enable(WebGLRenderingContext.CULL_FACE);
        gl.enable(WebGLRenderingContext.DEPTH_TEST);
        gl.enable(WebGLRenderingContext.DITHER);
    }

    clear() {
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);
    }

    getMinTextureLength(minLength: number): number {
        if (minLength < 1) {
            return 1;
        }
        const max = this.maxTexture2dSize;
        if (minLength > max) {
            return max;
        }
        return 1 << (Math.ceil(Math.log2(minLength)) | 0);
    }

    getMinTextureSize(viewportSize: ReadonlyVector2d): Vector2d {
        return new Vector2d(this.getMinTextureLength(viewportSize.x), this.getMinTextureLength(viewportSize.y));
    }

    render(callback: () => void) {
        const last = current;
        current = this;
        try {
            callback();
        } finally {
            current = last;
        }
    }

    roundCubeTextureSize(size: number): number {
        if (size < 1) {
            return 1;
        }
        if (size > this.maxCubeTextureSize) {
            return this.maxCubeTextureSize;
        }
        return 1 << Math.round(Math.log2(size));
    }

    roundTexture2dLength(size: number): number {
        if (size < 1) {
            return 1;
        }
        if (size > this.maxTexture2dSize) {
            return this.maxTexture2dSize;
        }
        return 1 << Math.round(Math.log2(size));
    }

    roundTexture2dSize(size: ReadonlyVector2d): Vector2d {
        return new Vector2d(this.roundTexture2dLength(size.x), this.roundTexture2dLength(size.y));
    }

    setTextureAnisotropic(target: GLenum, amount: number) {
        if (this.TEXTURE_MAX_ANISOTROPY !== 0) {
            this.gl.texParameterf(target, this.TEXTURE_MAX_ANISOTROPY, Math.round(amount * this.maxTextureAnisotropy));
        }
    }

    protected onDestroy() {
        this.renderToTexture.clearCache();
    }

    protected onResize() {
        this.renderToTexture.clearCache();
    }
}