import {PostEffect} from "./post-effect";
import {RenderingContext2d} from "../../render/rendering-context2d";

export class EmptyPostEffect implements PostEffect {

    static readonly INSTANCE = new EmptyPostEffect();

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