import { Context3d } from "../context";
import { Error3d } from "../error-3d";

export class FrameBuffer {

    private readonly _frameBuffer: WebGLFramebuffer;

    constructor(gl: WebGLRenderingContext) {
        this._frameBuffer = Error3d.execute(() => gl.createFramebuffer(), gl, () => 'Failed to create frame buffer.');
    }

    static check() {
        const gl = Context3d.current.gl;
        switch(gl.checkFramebufferStatus(WebGLRenderingContext.FRAMEBUFFER)) {
            case WebGLRenderingContext.FRAMEBUFFER_COMPLETE:
				return;
			case WebGLRenderingContext.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
				throw new Error('Framebuffer incomplete attachment.');
			case WebGLRenderingContext.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
				throw new Error('Framebuffer incomplete dimensions.');
			case WebGLRenderingContext.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
				throw new Error('Framebuffer incomplete missing attachment.');
			case WebGLRenderingContext.FRAMEBUFFER_UNSUPPORTED:
				throw new Error('Framebuffer unsupported.');
			default:
				Error3d.throwError(gl, 'Unknown framebuffer error.');
        }
    }

    begin() {
        Context3d.current.gl.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, this._frameBuffer);
    }

    end() {
        Context3d.current.gl.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, null);
    }

    delete(gl: WebGLRenderingContext) {
        gl.deleteFramebuffer(this._frameBuffer);
    }
}