import { ReadonlyVector2d, ReadonlyVector3d, ReferencedObject, Vector2d } from "@pluto/core";

export enum TextureWrap {
    REPEAT = WebGLRenderingContext.REPEAT,
    CLAMP = WebGLRenderingContext.CLAMP_TO_EDGE,
    MIRROR = WebGLRenderingContext.MIRRORED_REPEAT,
}

export enum TextureMipmapGenerator {
    NONE = 0,
    FASTEST = WebGLRenderingContext.FASTEST,
    NICEST = WebGLRenderingContext.NICEST,
}

export type StaticTextureImageSource = ImageBitmap | ImageData | HTMLImageElement | HTMLCanvasElement | OffscreenCanvas;

export interface Texture extends ReferencedObject {
    readonly texture: WebGLTexture;
    readonly dimension: 2 | 3;

    use(layer: number): void;
}

export interface ColorTexture extends Texture {
    readonly alpha: boolean;

    magFilter: boolean;
    minFilter: boolean;
    anisotropy: number;
}

export interface DepthTexture extends Texture {
    readonly stencil: boolean;
}

export interface Texture2d extends Texture {
    readonly size: ReadonlyVector2d;
}

export interface Texture3d extends Texture {
    readonly size: ReadonlyVector3d;
    wrapS: TextureWrap;
    wrapT: TextureWrap;
    wrapR: TextureWrap;
}

export interface CubeTexture extends Texture {
    readonly size: number;
}

export interface ColorTexture2d extends ColorTexture, Texture2d {
    physicalSize: Vector2d;
    wrapS: TextureWrap;
    wrapT: TextureWrap;
}