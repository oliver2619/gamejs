import { Animation, AnimationContainer } from "./animation";

export class ParallelAnimationSet implements AnimationContainer {

    enabled = true;

    private readonly animations: Animation[] = [];

    constructor(private readonly onFinished?: (remainingTimeout: number) => void) {
    }

    addAnimation(animation: Animation): void {
        this.animations.push(animation);
    }

    animate(timeout: number, onFinished: (remainingTimeout: number) => void): void {
        if (this.enabled) {
            let minRemaining: number | undefined;
            for (let i = 0; i < this.animations.length; ++i) {
                const a = this.animations[i]!;
                a.animate(timeout, remaining => {
                    this.animations.splice(i, 1);
                    --i;
                    if (minRemaining == undefined || remaining < minRemaining) {
                        minRemaining = remaining;
                    }
                });
            }
            if (this.animations.length === 0) {
                const remaining = minRemaining ?? 0;
                onFinished(remaining);
                if (this.onFinished != undefined) {
                    this.onFinished(remaining);
                }
            }
        }
    }
}