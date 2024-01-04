import {ReferencedObject} from 'core';
import {RenderingContext2d} from "../../render/rendering-context2d";

export interface PostEffect extends ReferencedObject {

    render(context: RenderingContext2d): void;
}