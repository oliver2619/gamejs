import { ReadonlyVector2d, Vector2d } from "@pluto/core";
import { TextureMipmapGenerator, TextureWrap } from "./texture";
import { Context3d } from "../context";
import { Error3d } from "../error-3d";
import { AbstractColorTexture2d } from "./abstract-color-texture-2d";

export class CanvasTexture2d extends AbstractColorTexture2d {

    private readonly _size: Vector2d;
    private readonly _alpha;
    private readonly _canvas = document.createElement('canvas');
    private readonly _context: CanvasRenderingContext2D;
    private readonly _format: GLenum;

    get alpha(): boolean {
        return this._alpha;
    }

    get size(): ReadonlyVector2d {
        return this._size;
    }

    constructor(context: Context3d, data: {
        alpha?: boolean,
        anisotropy?: number,
        magFilter?: boolean,
        minFilter?: boolean,
        mipmaps?: TextureMipmapGenerator,
        paint?: (context: CanvasRenderingContext2D) => void,
        physicalSize?: ReadonlyVector2d,
        size: ReadonlyVector2d,
        wrapS?: TextureWrap,
        wrapT?: TextureWrap,
    }) {
        super(context, data);
        this._alpha = data.alpha ?? false;
        this._format = this._alpha ? WebGLRenderingContext.RGBA : WebGLRenderingContext.RGB;
        this._size = data.size.clone();
        this._size.x = context.roundTexture2dLength(this._size.x);
        this._size.y = context.roundTexture2dLength(this._size.y);
        this._canvas.width = this._size.x;
        this._canvas.height = this._size.y;
        try {
            const ctx = this._canvas.getContext('2d', { alpha: this._alpha });
            if (ctx == undefined) {
                throw new Error('Failed to create CanvasRenderingContext2D');
            }
            this._context = ctx;
            if (data.paint != undefined) {
                data.paint(this._context);
            }
            this.update(() => {
                Error3d.execute(() => this.context.gl.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, this._format, this._format, WebGLRenderingContext.UNSIGNED_BYTE, this._canvas), this.context.gl);
                this.setImageModified();
            });
        } catch (e) {
            context.gl.deleteTexture(this.texture);
            throw e;
        }
    }

    paint(callback: (context: CanvasRenderingContext2D) => void) {
        callback(this._context);
        this.update(() => {
            this.context.gl.texSubImage2D(WebGLRenderingContext.TEXTURE_2D, 0, 0, 0, this._format, WebGLRenderingContext.UNSIGNED_BYTE, this._canvas);
            this.setImageModified();
        });
    }
}