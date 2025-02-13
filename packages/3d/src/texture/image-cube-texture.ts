import { Context3d } from "../context/context-3d";
import { AbstractTexture, ColorTexture, CubeTexture, ImageTexture, TextureMipmapGenerator } from "./texture";

export class ImageCubeTexture extends AbstractTexture implements ColorTexture, CubeTexture, ImageTexture {

    readonly alpha: boolean;

    constructor(context: Context3d, data: {
        alpha?: boolean,
        mipmaps?: TextureMipmapGenerator,
        minFilter?: boolean,
        magFilter?: boolean,
    }) {
        super(context, WebGLRenderingContext.TEXTURE_CUBE_MAP, data);
        this.alpha = data.alpha ?? false;
    }

    protected applyWrap(): void { }
}