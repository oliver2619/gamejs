import {Background} from "./background";
import {RenderingContext2d} from "../../render/rendering-context2d";

export class EmptyBackground implements Background {

    static readonly INSTANCE = new EmptyBackground();

    readonly hasReferences = false

    private constructor() {
    }

    addReference(holder: any): void {
    }

    releaseReference(holder: any): void {
    }

    render(context: RenderingContext2d) {
        context.clear();
    }
}