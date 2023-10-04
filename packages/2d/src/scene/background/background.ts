import {RenderingContext2d} from "../../render/rendering-context2d";
import {ReferencedObject} from "core/src/index";

export interface Background extends ReferencedObject {

    render(context: RenderingContext2d): void;
}