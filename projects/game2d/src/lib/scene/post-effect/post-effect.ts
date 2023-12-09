import {ReferencedObject} from 'projects/core/src/public-api';
import {RenderingContext2d} from "../../render/rendering-context2d";

export interface PostEffect extends ReferencedObject {

    render(context: RenderingContext2d): void;
}