import { ReadonlyRect2d } from "@ge/common";
import { Context3d } from "./context-3d";
import { Camera3d } from "../scene/camera/camera-3d";

let current: RenderingContext3d | undefined;

export class RenderingContext3d {

    static get current(): RenderingContext3d {
        if (current == undefined) {
            throw new Error('There is no active rendering context.');
        }
        return current;
    }

    static get currentGl(): WebGL2RenderingContext {
        return this.current.context.gl;
    }

    private constructor(readonly context: Context3d, readonly viewport: ReadonlyRect2d, readonly camera: Camera3d, readonly recursionDepth: number, readonly aspect: number) { }

    static render(viewport: ReadonlyRect2d, camera: Camera3d, callback: () => void) {
        const ctx = new RenderingContext3d(Context3d.current, viewport, camera, 0, 1);
        const last = current;
        current = ctx;
        try {
            ctx.context.gl.viewport(viewport.x1, viewport.y1, viewport.width, viewport.height);
            callback();
        } finally {
            current = last;
        }
    }
}