import { Animation } from "./animation";
import { AnimationContainer } from "./animation-container";
import { AnimationSequence } from "./animation-sequence";
import { AnimationSet } from "./animation-set";
import { FiniteAnimation } from "./finite-animation";
import { FiniteAnimationData } from "./finite-animation-data";
import { FiniteAnimationEvent } from "./finite-animation-event";
import { InfiniteAnimation } from "./infinite-animation";
import { InfiniteAnimationEvent } from "./infinite-animation-event";

export interface AnimationBuilderFiniteData extends FiniteAnimationData {
    callback: (event: FiniteAnimationEvent) => void;
}

export class AnimationBuilder {

    private constructor(private readonly animation: AnimationContainer) { }

    build(): Animation {
        return this.animation;
    }

    finite(data: AnimationBuilderFiniteData): AnimationBuilder {
        const a = new FiniteAnimation(data);
        a.onAnimate.subscribe(data.callback);
        this.animation.addAnimation(a);
        return this;
    }

    infinite(callback: (event: InfiniteAnimationEvent) => void): AnimationBuilder {
        const a = new InfiniteAnimation();
        a.onAnimate.subscribe(callback);
        this.animation.addAnimation(a);
        return this;
    }

    parallel(callback: (builder: AnimationBuilder) => void): AnimationBuilder {
        const builder = new AnimationBuilder(new AnimationSet());
        callback(builder);
        this.animation.addAnimation(builder.build());
        return this;
    }

    sequence(callback: (builder: AnimationBuilder) => void): AnimationBuilder {
        const builder = new AnimationBuilder(new AnimationSequence());
        callback(builder);
        this.animation.addAnimation(builder.build());
        return this;
    }

    static parallel(): AnimationBuilder {
        return new AnimationBuilder(new AnimationSet());
    }

    static sequence(): AnimationBuilder {
        return new AnimationBuilder(new AnimationSequence());
    }
}
