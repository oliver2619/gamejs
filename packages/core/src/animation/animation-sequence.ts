import { EventObservable } from "../event/event-observable";
import { Animation } from "./animation";
import { AnimationContainer } from "./animation-container";

export class AnimationSequence implements Animation, AnimationContainer {

    readonly onFinished = new EventObservable<Animation>();

    active = true;

    private readonly elements: Animation[] = [];

    addAnimation(animation: Animation) {
        this.elements.push(animation);
        if (this.elements.length === 1) {
            animation.onFinished.subscribeOnce(_ => this.proceedToNext());
        }
    }

    animate(timeout: number) {
        if (this.active) {
            if (this.elements.length === 0) {
                this.onFinished.produce(this);
                return;
            }
            this.elements[0].animate(timeout);
        }
    }

    private proceedToNext() {
        this.elements.splice(0, 1);
        if (this.elements.length > 0) {
            this.elements[0].onFinished.subscribeOnce(_ => this.proceedToNext());
        } else {
            this.onFinished.produce(this);
        }
    }
}