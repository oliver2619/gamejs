import { Point2d } from "@ge/common";

let current: Context3d | undefined;

export abstract class Context3d {

    readonly maxRenderBufferSize: number;
    readonly maxCubeTextureSize: number;
    readonly maxColorAttachments: number;
    readonly maxDrawBuffers: number;
    readonly maxSamples: number;
    readonly maxTextureLayers: number;

    private readonly maxTextureSize: number;
    private readonly maxTextureAnisotropy: number;
    private readonly TEXTURE_MAX_ANISOTROPY: number;

    static get current(): Context3d {
        if (current == undefined) {
            throw new Error('There is no active context.');
        }
        return current;
    }

    get canvasSize(): Point2d {
        return new Point2d(this.gl.canvas.width, this.gl.canvas.height);
    }

    constructor(readonly gl: WebGL2RenderingContext, readonly antialias: boolean) {
        this.maxTextureSize = gl.getParameter(WebGLRenderingContext.MAX_TEXTURE_SIZE);
        this.maxRenderBufferSize = gl.getParameter(WebGLRenderingContext.MAX_RENDERBUFFER_SIZE);
        this.maxCubeTextureSize = gl.getParameter(WebGLRenderingContext.MAX_CUBE_MAP_TEXTURE_SIZE);
        this.maxColorAttachments = gl.getParameter(WebGL2RenderingContext.MAX_COLOR_ATTACHMENTS);
        this.maxDrawBuffers = gl.getParameter(WebGL2RenderingContext.MAX_DRAW_BUFFERS);
        this.maxSamples = gl.getParameter(WebGL2RenderingContext.MAX_SAMPLES);
        this.maxTextureLayers = gl.getParameter(WebGLRenderingContext.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
        gl.enable(WebGLRenderingContext.CULL_FACE);
        gl.enable(WebGLRenderingContext.DEPTH_TEST);
        gl.enable(WebGLRenderingContext.DITHER);
        const extAnisotropic = gl.getExtension('EXT_texture_filter_anisotropic');
        if (extAnisotropic != null) {
            this.maxTextureAnisotropy = gl.getParameter(extAnisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
            this.TEXTURE_MAX_ANISOTROPY = extAnisotropic.TEXTURE_MAX_ANISOTROPY_EXT
        } else {
            this.maxTextureAnisotropy = 0;
            this.TEXTURE_MAX_ANISOTROPY = 0;
        }
    }

    getTextureSize(size: number): number {
        if (size < 1) {
            return 1;
        }
        if (size > this.maxTextureSize) {
            return this.maxTextureSize;
        }
        return 1 << Math.round(Math.log2(size));
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

    setTextureAnisotropic(target: GLenum, amount: number) {
        if (this.TEXTURE_MAX_ANISOTROPY !== 0) {
            this.gl.texParameterf(target, this.TEXTURE_MAX_ANISOTROPY, Math.round(amount * this.maxTextureAnisotropy));
        }
    }

    protected onDestroy() {

    }
}