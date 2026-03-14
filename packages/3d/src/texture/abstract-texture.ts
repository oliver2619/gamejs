import { AbstractReferencedObject } from "@pluto/core";
import { Texture } from "./texture";
import { Context3d } from "../context";
import { Error3d } from "../error-3d";

export abstract class AbstractTexture extends AbstractReferencedObject implements Texture {

    abstract readonly dimension: 2 | 3;
    readonly texture: WebGLTexture;
    private _parameterModified = true;
    private _imageModified = false;

    protected constructor(protected readonly context: Context3d, protected readonly target: GLenum) {
        super();
        this.texture = Error3d.execute(() => context.gl.createTexture(), this.context.gl, () => 'Failed to create texture.');
    }

    use(layer: number): void {
        this.context.gl.activeTexture(WebGLRenderingContext.TEXTURE0 + layer);
        this.context.gl.bindTexture(this.target, this.texture);
        if (this._imageModified) {
            this._imageModified = false;
        }
        if (this._parameterModified) {
            this._parameterModified = false;
            this.applyParameters();
        }
    }

    protected abstract applyParameters(): void;

    protected abstract generateMipmaps(): void;

    protected override onDelete(): void {
        this.context.gl.deleteTexture(this.texture);
    }

    protected setImageModified() {
        this._imageModified = true;
    }

    protected setParameterModified() {
        this._parameterModified = true;
    }

    protected update(callback: () => void) {
        this.context.gl.bindTexture(this.target, this.texture);
        try {
            callback();
        } finally {
            this.context.gl.bindTexture(this.target, null);
        }
    }
}
