import { EventObservable } from "../event/event-observable";

export interface Animation {

    readonly onFinished: EventObservable<Animation>;

    active: boolean;

    animate(timeout: number): void;
}