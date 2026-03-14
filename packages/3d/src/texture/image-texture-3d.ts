import { ReadonlyVector3d, Vector3d } from "@pluto/core";
import { Context3d } from "../context/context-3d";
import { Texture3d, TextureMipmapGenerator, TextureWrap } from "./texture";
import { AbstractColorTexture } from "./abstract-color-texture";

export class ImageTexture3d extends AbstractColorTexture implements Texture3d {

    readonly dimension = 3;

    physicalSize: Vector3d;

    private readonly _size = new Vector3d(0, 0, 0);
    private _alpha = false;
    private _wrapS: TextureWrap;
    private _wrapT: TextureWrap;
    private _wrapR: TextureWrap;

    get alpha(): boolean {
        return this._alpha;
    }

    get size(): ReadonlyVector3d {
        return this._size;
    }

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
        anisotropy?: number,
        magFilter?: boolean,
        minFilter?: boolean,
        mipmaps?: TextureMipmapGenerator,
        physicalSize?: ReadonlyVector3d,
        wrapS?: TextureWrap,
        wrapT?: TextureWrap,
        wrapR?: TextureWrap,
    }) {
        super(context, WebGL2RenderingContext.TEXTURE_3D, data);
        this.physicalSize = data.physicalSize?.clone() ?? new Vector3d(1, 1, 1);
        this._wrapS = data.wrapS ?? TextureWrap.REPEAT;
        this._wrapT = data.wrapT ?? TextureWrap.REPEAT;
        this._wrapR = data.wrapR ?? TextureWrap.REPEAT;
        // TODO set initial image
    }

    // TODO update and set image

    protected override applyParameters(): void {
        super.applyParameters();
        this.context.gl.texParameteri(this.target, WebGLRenderingContext.TEXTURE_WRAP_S, this._wrapS);
        this.context.gl.texParameteri(this.target, WebGLRenderingContext.TEXTURE_WRAP_T, this._wrapT);
        this.context.gl.texParameteri(this.target, WebGL2RenderingContext.TEXTURE_WRAP_R, this._wrapR);
    }
}