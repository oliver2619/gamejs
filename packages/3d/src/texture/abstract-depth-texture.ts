import { Context3d } from "../context";
import { AbstractTexture } from "./abstract-texture";
import { DepthTexture } from "./texture";

export abstract class AbstractDepthTexture extends AbstractTexture implements DepthTexture {

    protected constructor(context: Context3d, target: GLenum, readonly stencil: boolean) {
        super(context, target)
    }

    protected override generateMipmaps(): void {
    }

}