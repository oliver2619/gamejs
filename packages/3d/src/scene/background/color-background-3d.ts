import { Color } from "@ge/common";
import { Background3d } from "./background-3d";
import { RenderingContext3d } from "../../context/rendering-context-3d";

export class ColorBackground3d implements Background3d {

    constructor(public color: Color) { }

    addReference(_: any): void {
    }

    releaseReference(_: any): void {
    }

    render(): void {
        const ctx = RenderingContext3d.current;
        const gl = ctx.context.gl;
        // TODO why is scissor test not working???
        // gl.enable(WebGLRenderingContext.SCISSOR_TEST);
        // gl.scissor(ctx.viewport.x1, ctx.viewport.y1, ctx.viewport.width, ctx.viewport.height);
        gl.clearColor(this.color.r, this.color.g, this.color.b, this.color.a);
        gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT | WebGLRenderingContext.DEPTH_BUFFER_BIT);
        // gl.disable(WebGLRenderingContext.SCISSOR_TEST);
        
    }
}