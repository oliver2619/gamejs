import { Context3d } from "../context";
import { FrameBuffer } from "./frame-buffer";
import { ColorRenderTarget } from "./render-target";

export class FrameBufferCache {

    private readonly _stack: FrameBuffer[] = [];
    private nextIndex = 0;
    private current: FrameBuffer | undefined;

    constructor(private readonly gl: WebGLRenderingContext) { }

    clearCache(): void {
        this._stack.forEach(b => b.delete(this.gl));
        this._stack.splice(0, this._stack.length);
    }

    use<T extends ColorRenderTarget>(colorRenderTargets: T[], callback: () => void) {
        if (this.nextIndex >= this._stack.length) {
            this._stack.push(new FrameBuffer(this.gl));
        }
        const previous = this.current;
        let viewport: Int32Array | undefined;
        if (previous == undefined) {
            viewport = this.gl.getParameter(WebGLRenderingContext.VIEWPORT);
        }
        this.current = this._stack[this.nextIndex++]!;
        this.current.begin();
        Context3d.current.gl.drawBuffers(colorRenderTargets.map((_, l) => WebGLRenderingContext.COLOR_ATTACHMENT0 + l));
        try {
            callback();
        } finally {
            --this.nextIndex;
            this.current = previous;
            if (previous == undefined) {
                this.gl.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, null);
                Context3d.current.gl.drawBuffers([WebGLRenderingContext.BACK]);
                this.gl.viewport(viewport![0]!, viewport![1]!, viewport![2]!, viewport![3]!);
            } else {
                previous.begin();
            }
        }
    }
}