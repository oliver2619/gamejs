import {ReferencedObject} from "core";
import {RenderingContext2d} from "../../render/rendering-context2d";

export interface Background extends ReferencedObject {

    render(context: RenderingContext2d): void;
}