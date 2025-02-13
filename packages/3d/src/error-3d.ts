export class Error3d {

    static check(gl: WebGLRenderingContext, errorCallback: () => string) {
        const err = gl.getError();
        if (err !== WebGLRenderingContext.NO_ERROR) {
            this.throwErrorOf(errorCallback(), err);
        }
    }

    static throwError(msg: string, gl: WebGLRenderingContext): never {
        this.throwErrorOf(msg, gl.getError());
    }

    private static throwErrorOf(msg: string, err: GLenum): never {
        switch (err) {
            case WebGLRenderingContext.INVALID_ENUM:
                throw new RangeError(`${msg} (Invalid enum)`);
            case WebGLRenderingContext.INVALID_OPERATION:
                throw new RangeError(`${msg} (Invalid operation)`);
            case WebGLRenderingContext.INVALID_FRAMEBUFFER_OPERATION:
                throw new RangeError(`${msg} (Invalid framebuffer operation)`);
            case WebGLRenderingContext.INVALID_VALUE:
                throw new RangeError(`${msg} (Invalid value)`);
            case WebGLRenderingContext.OUT_OF_MEMORY:
                throw new Error(`${msg} (Out of memory)`);
            default:
                throw new Error(`${msg} (Unknown error)`);
        }
    }

}