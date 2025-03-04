import { PostEffect } from "./post-effect";

export class EmptyPostEffect extends PostEffect {

    static readonly INSTANCE = new EmptyPostEffect();

    private constructor() {
        super();
    }

    render(): void {
    }

    protected onDelete(): void {
    }
}