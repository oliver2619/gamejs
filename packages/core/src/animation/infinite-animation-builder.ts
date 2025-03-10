import { Animation, InfiniteAnimationEvent } from "./animation";
import { InfiniteAnimation } from "./infinite-animation";

export class InfiniteAnimationBuilder {

    onAnimate(callback: (ev: InfiniteAnimationEvent) => void): Animation {
        return new InfiniteAnimation(callback);
    }
}