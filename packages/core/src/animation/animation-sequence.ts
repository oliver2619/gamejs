import { Animation, AnimationContainer } from "./animation";

export class AnimationSequence implements AnimationContainer {

    enabled = true;

    private readonly animations: Animation[] = [];

    constructor(private readonly onFinished?: (remainingTimeout: number) => void) {
    }

    addAnimation(animation: Animation): void {
        this.animations.push(animation);
    }

    animate(timeout: number, onFinished: (remainingTimeout: number) => void) {
        if (this.enabled) {
            let remainingTime = timeout;
            while (remainingTime > 0) {
                if (this.animations.length === 0) {
                    onFinished(remainingTime);
                    if (this.onFinished != undefined) {
                        this.onFinished(remainingTime);
                    }
                    return;
                } else {
                    const nextTimeout = remainingTime;
                    remainingTime = 0;
                    this.animations[0]!.animate(nextTimeout, newRemainingTime => {
                        remainingTime = newRemainingTime;
                        this.next(newRemainingTime);
                    });
                }
            }
        }
    }

    private next(remainingTime: number) {
        this.animations.splice(0, 1);
        if (this.animations.length === 0 && this.onFinished != undefined) {
            this.onFinished(remainingTime);
        }
    }
}