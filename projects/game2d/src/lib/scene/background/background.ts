import {RenderingContext2d} from "../../render/rendering-context2d";
import {ReferencedObject} from "projects/core/src/public-api";

export interface Background extends ReferencedObject {

    render(context: RenderingContext2d): void;
}