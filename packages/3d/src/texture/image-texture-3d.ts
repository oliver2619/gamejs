import { ReadonlyVector3d, Vector3d } from "@ge/common";
import { Context3d } from "../context/context-3d";
import { AbstractTexture, ColorTexture, ImageTexture, Texture3d, TextureMipmapGenerator, TextureWrap } from "./texture";

export class ImageTexture3d extends AbstractTexture implements ColorTexture, Texture3d, ImageTexture {

    readonly alpha: boolean;
    physicalSize: Vector3d;

    private _wrapS: TextureWrap;
    private _wrapT: TextureWrap;
    private _wrapR: TextureWrap;

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

    get wrapR(): TextureWrap {
        return this._wrapR;
    }

    set wrapR(w: TextureWrap) {
        if (this._wrapR !== w) {
            this._wrapR = w;
            this.setParameterModified();
        }
    }

    constructor(context: Context3d, data: {
        alpha?: boolean,
        mipmaps?: TextureMipmapGenerator,
        minFilter?: boolean,
        magFilter?: boolean,
        wrapS?: TextureWrap,
        wrapT?: TextureWrap,
        wrapR?: TextureWrap,
        physicalSize?: ReadonlyVector3d
    }) {
        super(context, WebGL2RenderingContext.TEXTURE_3D, data);
        this.alpha = data.alpha ?? false;
        this.physicalSize = data.physicalSize?.clone() ?? new Vector3d(1, 1, 1);
        this._wrapS = data.wrapS ?? TextureWrap.REPEAT;
        this._wrapT = data.wrapT ?? TextureWrap.REPEAT;
        this._wrapR = data.wrapR ?? TextureWrap.REPEAT;
    }

    protected applyWrap(): void {

    }
}