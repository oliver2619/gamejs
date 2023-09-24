import { EventObservable } from "../event/event-observable";
import { ButtonInput } from "./button-input";

export class ButtonComplementState {

    readonly onChange = new EventObservable<number>();

    get value(): number {
        return (this.increase.value ? 1 : 0) - (this.decrease.value ? 1 : 0);
    }

    constructor(private readonly decrease: ButtonInput, private readonly increase: ButtonInput) {
        const cb = (_: boolean) => this.onChange.produce(this.value);
        decrease.onChange.subscribe(cb);
        increase.onChange.subscribe(cb);
    }
}