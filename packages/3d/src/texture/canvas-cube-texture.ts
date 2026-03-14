import { Context3d } from "../context";
import { Error3d } from "../error-3d";
import { AbstractColorCubeTexture } from "./abstract-color-cube-texture";
import { TextureMipmapGenerator } from "./texture";

export interface CanvasCubeTextureContexts {
    readonly negX: CanvasRenderingContext2D;
    readonly negY: CanvasRenderingContext2D;
    readonly negZ: CanvasRenderingContext2D;
    readonly posX: CanvasRenderingContext2D;
    readonly posY: CanvasRenderingContext2D;
    readonly posZ: CanvasRenderingContext2D;
}

type A = { readonly [K in keyof CanvasCubeTextureContexts]: HTMLCanvasElement };

export class CanvasCubeTexture extends AbstractColorCubeTexture {

    private readonly _alpha: boolean;
    private readonly _size: number;
    private readonly _canvases: A = {
        negX: document.createElement('canvas'),
        negY: document.createElement('canvas'),
        negZ: document.createElement('canvas'),
        posX: document.createElement('canvas'),
        posY: document.createElement('canvas'),
        posZ: document.createElement('canvas'),
    };
    private readonly _contexts: CanvasCubeTextureContexts;
    private readonly _format: GLenum;

    get alpha(): boolean {
        return this._alpha;
    }

    get size(): number {
        return this._size;
    }

    constructor(context: Context3d, data: {
        alpha?: boolean,
        anisotropy?: number,
        magFilter?: boolean,
        minFilter?: boolean,
        mipmaps?: TextureMipmapGenerator,
        paint?: (contexts: CanvasCubeTextureContexts) => void,
        size: number,
    }) {
        super(context, data);
        this._alpha = data.alpha ?? false;
        this._size = context.roundCubeTextureSize(data.size);
        this._format = this._alpha ? WebGLRenderingContext.RGBA : WebGLRenderingContext.RGB;
        try {
            const contextList = Object.entries(this._canvases).map(([target, canvas]) => {
                canvas.width = this._size;
                canvas.height = this._size;
                const ctx = canvas.getContext('2d', { alpha: this._alpha });
                if (ctx == null) {
                    throw new Error('Failed to create CanvasRenderingContext2D');
                }
                return [target, ctx];
            });
            this._contexts = Object.fromEntries(contextList);
            if (data.paint != undefined) {
                data.paint(this._contexts);
            }
            this.update(() => {
                Error3d.execute(() => this.context.gl.texImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, this._format, this._format, WebGLRenderingContext.UNSIGNED_BYTE, this._canvases.negX), this.context.gl);
                Error3d.execute(() => this.context.gl.texImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, this._format, this._format, WebGLRenderingContext.UNSIGNED_BYTE, this._canvases.negY), this.context.gl);
                Error3d.execute(() => this.context.gl.texImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, this._format, this._format, WebGLRenderingContext.UNSIGNED_BYTE, this._canvases.negZ), this.context.gl);
                Error3d.execute(() => this.context.gl.texImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_X, 0, this._format, this._format, WebGLRenderingContext.UNSIGNED_BYTE, this._canvases.posX), this.context.gl);
                Error3d.execute(() => this.context.gl.texImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, this._format, this._format, WebGLRenderingContext.UNSIGNED_BYTE, this._canvases.posY), this.context.gl);
                Error3d.execute(() => this.context.gl.texImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, this._format, this._format, WebGLRenderingContext.UNSIGNED_BYTE, this._canvases.posZ), this.context.gl);
                this.setImageModified();
            });
        } catch (e) {
            context.gl.deleteTexture(this.texture);
            throw e;
        }
    }

    paint(callback: (contexts: CanvasCubeTextureContexts) => void) {
        callback(this._contexts);
        this.update(() => {
            const gl = this.context.gl;
            gl.texSubImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, 0, 0, this._format, WebGLRenderingContext.UNSIGNED_BYTE, this._canvases.negX);
            gl.texSubImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, 0, 0, this._format, WebGLRenderingContext.UNSIGNED_BYTE, this._canvases.negY);
            gl.texSubImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, 0, 0, this._format, WebGLRenderingContext.UNSIGNED_BYTE, this._canvases.negZ);
            gl.texSubImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_X, 0, 0, 0, this._format, WebGLRenderingContext.UNSIGNED_BYTE, this._canvases.posX);
            gl.texSubImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_X, 0, 0, 0, this._format, WebGLRenderingContext.UNSIGNED_BYTE, this._canvases.posY);
            gl.texSubImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_X, 0, 0, 0, this._format, WebGLRenderingContext.UNSIGNED_BYTE, this._canvases.posZ);
            this.setImageModified();
        });
    }
}