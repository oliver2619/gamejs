import { PostEffect } from "./post-effect";

export class EmptyPostEffect extends PostEffect {

    render(): void {
    }

    protected onDelete(): void {
    }
}