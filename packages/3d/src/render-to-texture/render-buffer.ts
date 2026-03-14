import { ReadonlyVector2d, Vector2d } from "@pluto/core";
import { Error3d } from "../error-3d";
import { RenderTarget } from "./render-target";

export abstract class RenderBuffer implements RenderTarget {

    protected readonly _renderBuffer: WebGLRenderbuffer;

    private _viewportSize: Vector2d;

    get viewportSize(): ReadonlyVector2d {
        return this._viewportSize;
    }

    protected constructor(data: {
        gl: WebGLRenderingContext,
        size: ReadonlyVector2d,
    }) {
        this._viewportSize = data.size.clone();
        this._renderBuffer = Error3d.execute(() => data.gl.createRenderbuffer(), data.gl, () => 'Failed to create render buffer.');
    }

    delete(gl: WebGLRenderingContext) {
        gl.deleteRenderbuffer(this._renderBuffer);
    }

    protected update(gl: WebGLRenderingContext, callback: () => void) {
        gl.bindRenderbuffer(WebGLRenderingContext.RENDERBUFFER, this._renderBuffer);
        try {
            callback();
        } finally {
            gl.bindRenderbuffer(WebGLRenderingContext.RENDERBUFFER, null);
        }
    }
}