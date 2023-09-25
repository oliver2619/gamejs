import {PostEffect} from "./post-effect";
import {RenderingContext2d} from "../../rendering-context2d";

export class PostEffectNone implements PostEffect {

    static readonly INSTANCE = new PostEffectNone();

    readonly hasReferences = false

    private constructor() {
    }

    addReference(holder: any): void {
    }

    releaseReference(holder: any): void {
    }

    render(context: RenderingContext2d): void {
    }

}