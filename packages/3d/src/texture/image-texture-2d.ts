import { ReadonlyVector2d, Vector2d } from "@ge/common";
import { Context3d } from "../context";
import { AbstractTexture, ColorTexture, ImageTexture, Texture2d, TextureMipmapGenerator, TextureWrap } from "./texture";

// TODO texSubImage

export class ImageTexture2d extends AbstractTexture implements ColorTexture, Texture2d, ImageTexture {

    readonly alpha: boolean;
    physicalSize: Vector2d;

    private _wrapS: TextureWrap;
    private _wrapT: TextureWrap;

    get wrapS(): TextureWrap {
        return this._wrapS;
    }

    set wrapS(w: TextureWrap) {
        if (this._wrapS !== w) {
            this._wrapS = w;
            this.setParameterModified();
        }
    }

    get wrapT(): TextureWrap {
        return this._wrapT;
    }

    set wrapT(w: TextureWrap) {
        if (this._wrapT !== w) {
            this._wrapT = w;
            this.setParameterModified();
        }
    }

    constructor(context: Context3d, data: {
        image: TexImageSource,
        alpha?: boolean,
        mipmaps?: TextureMipmapGenerator,
        magFilter?: boolean,
        minFilter?: boolean,
        wrapS?: TextureWrap,
        wrapT?: TextureWrap,
        physicalSize?: ReadonlyVector2d
    }) {
        super(context, WebGLRenderingContext.TEXTURE_2D, data);
        this.alpha = data.alpha ?? false;
        this.physicalSize = data.physicalSize?.clone() ?? new Vector2d(1, 1);
        this._wrapS = data.wrapS ?? TextureWrap.REPEAT;
        this._wrapT = data.wrapT ?? TextureWrap.REPEAT;
        const format = this.alpha ? WebGLRenderingContext.RGBA : WebGLRenderingContext.RGB
        this.context.gl.texImage2D(this.target, 0, format, format, WebGLRenderingContext.UNSIGNED_BYTE, data.image);
    }

    protected override applyWrap(): void {
        this.context.gl.texParameteri(this.target, WebGLRenderingContext.TEXTURE_WRAP_S, this._wrapS);
        this.context.gl.texParameteri(this.target, WebGLRenderingContext.TEXTURE_WRAP_T, this._wrapT);
    }
}