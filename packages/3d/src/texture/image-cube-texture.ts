import { ImageObject } from "@pluto/core";
import { Context3d } from "../context/context-3d";
import { Error3d } from "../error-3d";
import { StaticTextureImageSource, TextureMipmapGenerator } from "./texture";
import { AbstractColorCubeTexture } from "./abstract-color-cube-texture";

export class ImageCubeTexture extends AbstractColorCubeTexture {

    private _size: number = 0;
    private _alpha: boolean = false;
    private _format: GLenum = WebGLRenderingContext.RGB;

    get alpha(): boolean {
        return this._alpha;
    }

    get size(): number {
        return this._size;
    }

    constructor(context: Context3d, data: {
        anisotropy?: number | undefined,
        magFilter?: boolean| undefined,
        minFilter?: boolean| undefined,
        mipmaps?: TextureMipmapGenerator| undefined,
        images: {
            posX: StaticTextureImageSource,
            negX: StaticTextureImageSource,
            posY: StaticTextureImageSource,
            negY: StaticTextureImageSource,
            posZ: StaticTextureImageSource,
            negZ: StaticTextureImageSource,
            alpha: boolean,
        }
    }) {
        super(context, data);
        try {
            this.setImages(data.images);
        } catch (e) {
            context.gl.deleteTexture(this.texture);
            throw e;
        }
    }

    setImages(images: {
        posX: StaticTextureImageSource,
        negX: StaticTextureImageSource,
        posY: StaticTextureImageSource,
        negY: StaticTextureImageSource,
        posZ: StaticTextureImageSource,
        negZ: StaticTextureImageSource,
        alpha: boolean,
    }) {
        this.update(() => {
            const format = images.alpha ? WebGLRenderingContext.RGBA : WebGLRenderingContext.RGB;
            const targetSize = this.context.roundCubeTextureSize(Math.sqrt(images.negX.width * images.negX.height));
            this.setTexImage(WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_X, format, images.negX, targetSize);
            this.setTexImage(WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Y, format, images.negY, targetSize);
            this.setTexImage(WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Z, format, images.negZ, targetSize);
            this.setTexImage(WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_X, format, images.posX, targetSize);
            this.setTexImage(WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Y, format, images.posY, targetSize);
            this.setTexImage(WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Z, format, images.posZ, targetSize);
            this._format = format;
            this._alpha = images.alpha ?? false;
            this._size = images.negX.width;
            this.setImageModified();
        });
    }

    updateImages(images: {
        posX: StaticTextureImageSource,
        negX: StaticTextureImageSource,
        posY: StaticTextureImageSource,
        negY: StaticTextureImageSource,
        posZ: StaticTextureImageSource,
        negZ: StaticTextureImageSource,
    }) {
        this.update(() => {
            const gl = this.context.gl;
            gl.texSubImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, 0, 0, this._format, WebGLRenderingContext.UNSIGNED_BYTE, images.negX);
            gl.texSubImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, 0, 0, this._format, WebGLRenderingContext.UNSIGNED_BYTE, images.negY);
            gl.texSubImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, 0, 0, this._format, WebGLRenderingContext.UNSIGNED_BYTE, images.negZ);
            gl.texSubImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_X, 0, 0, 0, this._format, WebGLRenderingContext.UNSIGNED_BYTE, images.posX);
            gl.texSubImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, 0, 0, this._format, WebGLRenderingContext.UNSIGNED_BYTE, images.posY);
            gl.texSubImage2D(WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, 0, 0, this._format, WebGLRenderingContext.UNSIGNED_BYTE, images.posZ);
            this.setImageModified();
        });
    }

    private setTexImage(target: GLenum, format: GLenum, img: StaticTextureImageSource, size: number) {
        const rescaled = new ImageObject(img).resized(size, size).staticTextureImageSource;
        Error3d.execute(() => this.context.gl.texImage2D(target, 0, format, format, WebGLRenderingContext.UNSIGNED_BYTE, rescaled), this.context.gl);
    }
}