import { ReadonlyVector2d, Vector2d } from "@pluto/core";
import { AbstractColorTexture } from "./abstract-color-texture";
import { ColorTexture2d, TextureMipmapGenerator, TextureWrap } from "./texture";
import { Context3d } from "../context";

export abstract class AbstractColorTexture2d extends AbstractColorTexture implements ColorTexture2d {

    abstract readonly size: ReadonlyVector2d;

    readonly dimension = 2;

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

    protected constructor(context: Context3d, data: {
        alpha?: boolean | undefined,
        anisotropy?: number | undefined,
        magFilter?: boolean | undefined,
        minFilter?: boolean | undefined,
        mipmaps?: TextureMipmapGenerator | undefined,
        physicalSize?: ReadonlyVector2d | undefined,
        wrapS?: TextureWrap | undefined,
        wrapT?: TextureWrap | undefined,
    }) {
        super(context, WebGLRenderingContext.TEXTURE_2D, data);
        this.physicalSize = data.physicalSize?.clone() ?? new Vector2d(1, 1);
        this._wrapS = data.wrapS ?? TextureWrap.REPEAT;
        this._wrapT = data.wrapT ?? TextureWrap.REPEAT;

    }

    protected override applyParameters(): void {
        super.applyParameters();
        this.context.gl.texParameteri(this.target, WebGLRenderingContext.TEXTURE_WRAP_S, this._wrapS);
        this.context.gl.texParameteri(this.target, WebGLRenderingContext.TEXTURE_WRAP_T, this._wrapT);
    }
}