import { Animation, AnimationContainer } from "./animation";
import { AnimationSequence } from "./animation-sequence";
import { FiniteAnimationBuilder } from "./finite-animation-builder";
import { InfiniteAnimationBuilder } from "./infinite-animation-builder";
import { ParallelAnimationSet } from "./parallel-animation-set";

export class AnimationBuilder {

    private constructor(private container: AnimationContainer) { }

    static finite(duration: number): FiniteAnimationBuilder {
        return new FiniteAnimationBuilder(duration);
    }

    static infinite(): InfiniteAnimationBuilder {
        return new InfiniteAnimationBuilder();
    }

    static parallel(onFinished?: (remainingTimeout: number) => void): AnimationBuilder {
        return new AnimationBuilder(new ParallelAnimationSet(onFinished));
    }

    static sequence(onFinished?: (remainingTimeout: number) => void): AnimationBuilder {
        return new AnimationBuilder(new AnimationSequence(onFinished));
    }

    build(): AnimationContainer {
        return this.container;
    }

    finite(duration: number, callback: (builder: FiniteAnimationBuilder) => Animation): AnimationBuilder {
        const builder = new FiniteAnimationBuilder(duration);
        this.container.addAnimation(callback(builder));
        return this;
    }

    infinite(callback: (builder: InfiniteAnimationBuilder) => Animation): AnimationBuilder {
        const builder = new InfiniteAnimationBuilder();
        this.container.addAnimation(callback(builder));
        return this;
    }

    parallel(callback: (builder: AnimationBuilder) => void, onFinished?: (remainingTimeout: number) => void) {
        const builder = AnimationBuilder.parallel(onFinished);
        callback(builder);
        this.container.addAnimation(builder.build());
        return this;
    }

    sequence(callback: (builder: AnimationBuilder) => void, onFinished?: (remainingTimeout: number) => void): AnimationBuilder {
        const builder = AnimationBuilder.sequence(onFinished);
        callback(builder);
        this.container.addAnimation(builder.build());
        return this;
    }

}