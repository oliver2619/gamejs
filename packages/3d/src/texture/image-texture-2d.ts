import { ImageObject, ReadonlyVector2d, Vector2d } from "@pluto/core";
import { Context3d } from "../context";
import { StaticTextureImageSource, TextureMipmapGenerator, TextureWrap } from "./texture";
import { Error3d } from "../error-3d";
import { AbstractColorTexture2d } from "./abstract-color-texture-2d";

export class ImageTexture2d extends AbstractColorTexture2d {

    private readonly _size = new Vector2d(0, 0);
    private _alpha = false;
    private _format: GLenum = WebGLRenderingContext.RGB;

    get alpha(): boolean {
        return this._alpha;
    }

    get size(): ReadonlyVector2d {
        return this._size;
    }

    constructor(context: Context3d, data: {
        alpha?: boolean | undefined,
        anisotropy?: number | undefined,
        image: StaticTextureImageSource,
        magFilter?: boolean | undefined,
        minFilter?: boolean | undefined,
        mipmaps?: TextureMipmapGenerator | undefined,
        physicalSize?: ReadonlyVector2d | undefined,
        wrapS?: TextureWrap | undefined,
        wrapT?: TextureWrap | undefined,
    }) {
        super(context, data);
        try {
            this.setImage(data.image, data.alpha);
        } catch (e) {
            context.gl.deleteTexture(this.texture);
            throw e;
        }
    }

    setImage(image: StaticTextureImageSource, alpha?: boolean) {
        const imageObject = new ImageObject(image, alpha);
        const targetWidth = this.context.roundTexture2dLength(imageObject.width);
        const targetHeight = this.context.roundTexture2dLength(imageObject.height);
        const imageObjectScaled = imageObject.resized(targetWidth, targetHeight);
        const format = imageObjectScaled.alpha ? WebGLRenderingContext.RGBA : WebGLRenderingContext.RGB
        this.update(() => {
            Error3d.execute(() => this.context.gl.texImage2D(this.target, 0, format, format, WebGLRenderingContext.UNSIGNED_BYTE, imageObjectScaled.staticTextureImageSource), this.context.gl);
            this.setImageModified();
        });
        this._alpha = imageObjectScaled.alpha;
        this._size.set(imageObjectScaled.width, imageObjectScaled.height);
        this._format = format;
    }

    updateImage(image: StaticTextureImageSource) {
        this.update(() => {
            this.context.gl.texSubImage2D(this.target, 0, 0, 0, Math.min(this._size.x, image.width), Math.min(this._size.y, image.height), this._format, WebGLRenderingContext.UNSIGNED_BYTE, image);
            this.setImageModified();
        });
    }
}