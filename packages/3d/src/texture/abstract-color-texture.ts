import { Context3d } from "../context";
import { AbstractTexture } from "./abstract-texture";
import { ColorTexture, TextureMipmapGenerator } from "./texture";

export abstract class AbstractColorTexture extends AbstractTexture implements ColorTexture {

    abstract readonly alpha: boolean;

    private readonly _mipmapGenerator: TextureMipmapGenerator;
    private _magFilter: boolean;
    private _minFilter: boolean;
    private _anisotropy: number;

    get anisotropy(): number {
        return this._anisotropy;
    }

    set anisotropy(a: number) {
        if (this._anisotropy !== a) {
            this._anisotropy = a;
            this.setParameterModified();
        }
    }

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

    protected constructor(context: Context3d, target: GLenum, data: {
        anisotropy?: number | undefined,
        minFilter?: boolean | undefined,
        mipmaps?: TextureMipmapGenerator | undefined,
        magFilter?: boolean | undefined,
    }) {
        super(context, target);
        this._anisotropy = data.anisotropy ?? 0;
        this._magFilter = data.magFilter ?? false;
        this._minFilter = data.minFilter ?? false;
        this._mipmapGenerator = data.mipmaps ?? TextureMipmapGenerator.NONE;
    }

    // texture must be bound
    protected applyParameters() {
        this.context.gl.texParameteri(this.target, WebGLRenderingContext.TEXTURE_MAG_FILTER, this._magFilter ? WebGLRenderingContext.LINEAR : WebGLRenderingContext.NEAREST);
        if (this._minFilter) {
            if (this._mipmapGenerator === TextureMipmapGenerator.NONE) {
                this.context.gl.texParameteri(this.target, WebGLRenderingContext.TEXTURE_MIN_FILTER, WebGLRenderingContext.LINEAR);
            } else {
                this.context.gl.texParameteri(this.target, WebGLRenderingContext.TEXTURE_MIN_FILTER, WebGLRenderingContext.LINEAR_MIPMAP_LINEAR);
                this.context.setTextureAnisotropic(this.target, this._anisotropy);
            }
        } else {
            if (this._mipmapGenerator === TextureMipmapGenerator.NONE) {
                this.context.gl.texParameteri(this.target, WebGLRenderingContext.TEXTURE_MIN_FILTER, WebGLRenderingContext.NEAREST);
            } else {
                this.context.gl.texParameteri(this.target, WebGLRenderingContext.TEXTURE_MIN_FILTER, WebGLRenderingContext.NEAREST_MIPMAP_NEAREST);
                this.context.setTextureAnisotropic(this.target, 0);
            }
        }
    }

    // texture must be bound
    protected override generateMipmaps(): void {
        if (this._mipmapGenerator != TextureMipmapGenerator.NONE) {
            this.context.gl.hint(WebGLRenderingContext.GENERATE_MIPMAP_HINT, this._mipmapGenerator);
            this.context.gl.generateMipmap(this.target);
        }        
    }
}