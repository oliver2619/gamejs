import { EventObservable } from "../event/event-observable";
import { Animation } from "./animation";
import { AnimationContainer } from "./animation-container";

class Item {

    finished = false;

    constructor(readonly animation: Animation) {
        animation.onFinished.subscribeOnce(_ => this.finished = true);
    }
}

export class AnimationSet implements Animation, AnimationContainer {

    readonly onFinished = new EventObservable<Animation>();

    active: boolean = true;

    private readonly elements: Item[] = [];

    addAnimation(animation: Animation) {
        this.elements.push(new Item(animation));
    }

    animate(timeout: number): void {
        if (this.active) {
            for (let i = 0; i < this.elements.length; ++i) {
                const el = this.elements[i];
                el.animation.animate(timeout);
                if (el.finished) {
                    this.elements.splice(i, 1);
                    --i;
                }
            }
            if (this.elements.length === 0) {
                this.onFinished.produce(this);
            }
        }
    }


}