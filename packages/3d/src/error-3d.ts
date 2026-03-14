export class Error3d {

    static check(gl: WebGLRenderingContext, errorMessageProvider?: () => string) {
        const err = gl.getError();
        if (err !== WebGLRenderingContext.NO_ERROR) {
            if (errorMessageProvider == undefined) {
                this.throwErrorOf(err);
            } else {
                this.throwErrorOf(err, errorMessageProvider());
            }
        }
    }

    static execute<R>(callback: () => R, gl: WebGLRenderingContext, errorMessageProvider?: () => string): R {
        const err = gl.getError();
        if (err !== WebGLRenderingContext.NO_ERROR) {
            console.warn(`Execute entered with error state ${this.getErrorConstantString(err)}`);
        }
        const ret = callback();
        this.check(gl, errorMessageProvider);
        return ret;
    }

    static throwError(gl: WebGLRenderingContext, msg?: string): never {
        this.throwErrorOf(gl.getError(), msg);
    }

    private static throwErrorOf(err: GLenum, msg?: string): never {
        switch (err) {
            case WebGLRenderingContext.INVALID_ENUM:
            case WebGLRenderingContext.INVALID_OPERATION:
            case WebGLRenderingContext.INVALID_FRAMEBUFFER_OPERATION:
            case WebGLRenderingContext.INVALID_VALUE:
                if (msg == undefined) {
                    throw new RangeError(this.getErrorConstantString(err));
                } else {
                    throw new RangeError(`${msg} (${this.getErrorConstantString(err)})`);
                }
            default:
                if (msg == undefined) {
                    throw new Error(this.getErrorConstantString(err));
                } else {
                    throw new Error(`${msg} (${this.getErrorConstantString(err)})`);
                }
        }
    }

    private static getErrorConstantString(err: GLenum): string {
        switch (err) {
            case WebGLRenderingContext.INVALID_ENUM:
                return 'Invalid enum';
            case WebGLRenderingContext.INVALID_OPERATION:
                return 'Invalid operation';
            case WebGLRenderingContext.INVALID_FRAMEBUFFER_OPERATION:
                return 'Invalid framebuffer operation';
            case WebGLRenderingContext.INVALID_VALUE:
                return 'Invalid value';
            case WebGLRenderingContext.OUT_OF_MEMORY:
                return 'Out of memory';
            case WebGLRenderingContext.CONTEXT_LOST_WEBGL:
                return 'WebGL context lost';
            default:
                return 'Unknown error';
        }
    }

}