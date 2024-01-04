import { ReferencedObject } from 'core';
import { RenderingContext2d } from '../render/rendering-context2d';
import { Camera2 } from './camera2';

export interface Scene2d extends ReferencedObject {

    render(context: RenderingContext2d, camera: Camera2): void;
}