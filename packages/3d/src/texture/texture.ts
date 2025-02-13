import { ReferencedObject, ReferencedObjects, Vector2d, Vector3d } from "@ge/common";
import { Context3d } from "../context";

// TODO some textures can't apply min / mag filter

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

export interface Texture extends ReferencedObject {
    readonly texture: WebGLTexture;

    magFilter: boolean;
    minFilter: boolean;

    use(layer: number): void;
}

export interface ColorTexture extends Texture {
    readonly alpha: boolean;
}

export interface DepthTexture extends Texture {
}

export interface Texture2d extends Texture {
    physicalSize: Vector2d;
    wrapS: TextureWrap;
    wrapT: TextureWrap;
}

export interface Texture3d extends Texture {
    physicalSize: Vector3d;
    wrapS: TextureWrap;
    wrapT: TextureWrap;
    wrapR: TextureWrap;
}

export interface CubeTexture extends Texture {
}

export interface ImageTexture extends Texture {
}

export interface RenderTargetTexture extends Texture {
}

export abstract class AbstractTexture implements Texture {

    readonly texture: WebGLTexture;

    private readonly referencedObject = ReferencedObjects.create(() => this.onDestroy());

    private parameterModified = true;
    private imageModified = true;
    private readonly _mipmaps: TextureMipmapGenerator;
    private _magFilter: boolean;
    private _minFilter: boolean;

    get magFilter(): boolean {
        return this._magFilter;
    }

    set magFilter(f: boolean) {
        if (this._magFilter !== f) {
            this._magFilter = f;
            this.setParameterModified();
        }
    }

    get minFilter(): boolean {
        return this._minFilter;
    }

    set minFilter(f: boolean) {
        if (this._minFilter !== f) {
            this._minFilter = f;
            this.setParameterModified();
        }
    }

    protected constructor(protected readonly context: Context3d, protected readonly target: GLenum, data: { mipmaps?: TextureMipmapGenerator, minFilter?: boolean, magFilter?: boolean }) {
        this._mipmaps = data.mipmaps ?? TextureMipmapGenerator.NONE;
        this._minFilter = data.minFilter ?? false;
        this._magFilter = data.magFilter ?? false;
        this.texture = context.gl.createTexture();
        context.gl.bindTexture(target, this.texture);
    }

    addReference(owner: any): void {
        this.referencedObject.addReference(owner);
    }

    releaseReference(owner: any): void {
        this.referencedObject.releaseReference(owner);
    }

    use(layer: number): void {
        this.context.gl.activeTexture(WebGLRenderingContext.TEXTURE0 + layer);
        this.context.gl.bindTexture(this.target, this.texture);
        if (this.imageModified) {
            this.imageModified = false;
            if (this._mipmaps != TextureMipmapGenerator.NONE) {
                this.context.gl.hint(WebGLRenderingContext.GENERATE_MIPMAP_HINT, this._mipmaps);
                this.context.gl.generateMipmap(this.target);
            }
        }
        if (this.parameterModified) {
            this.parameterModified = false;
            this.applyFilter();
            this.applyWrap();
        }
    }

    protected abstract applyWrap(): void;

    protected setParameterModified() {
        this.parameterModified = true;
    }

    private applyFilter() {
        this.context.gl.texParameteri(this.target, WebGLRenderingContext.TEXTURE_MAG_FILTER, this._magFilter ? WebGLRenderingContext.LINEAR : WebGLRenderingContext.NEAREST);
        if (this._minFilter) {
            if (this._mipmaps) {
                this.context.gl.texParameteri(this.target, WebGLRenderingContext.TEXTURE_MIN_FILTER, WebGLRenderingContext.LINEAR_MIPMAP_LINEAR);
                this.context.setTextureAnisotropic(this.target, 1);
            } else {
                this.context.gl.texParameteri(this.target, WebGLRenderingContext.TEXTURE_MIN_FILTER, WebGLRenderingContext.LINEAR);
            }
        } else {
            if (this._mipmaps) {
                this.context.gl.texParameteri(this.target, WebGLRenderingContext.TEXTURE_MIN_FILTER, WebGLRenderingContext.NEAREST_MIPMAP_NEAREST);
                this.context.setTextureAnisotropic(this.target, 0);
            } else {
                this.context.gl.texParameteri(this.target, WebGLRenderingContext.TEXTURE_MIN_FILTER, WebGLRenderingContext.NEAREST);
            }
        }
    }

    private onDestroy() {
        this.context.gl.deleteTexture(this.texture);
    }
}