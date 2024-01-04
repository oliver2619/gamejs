import { EventObservable } from "core";
import { DynamicBody, DynamicBodyData } from "./dynamic-body";

export interface AnimatedBodyPreAnimateEvent {
    readonly body: AnimatedBody;
    readonly timeout: number;
}

export interface AnimatedBodyData extends DynamicBodyData {
}

export class AnimatedBody extends DynamicBody {

    readonly onPreAnimate = new EventObservable<AnimatedBodyPreAnimateEvent>();

    constructor(data: AnimatedBodyData) {
        super(data);
    }
}