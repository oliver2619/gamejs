import {ReferencedObject} from 'core/src/index';
import {RenderingContext2d} from "../../rendering-context2d";

export interface PostEffect extends ReferencedObject {

    render(context: RenderingContext2d): void;
}