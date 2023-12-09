import { EventObservable } from "../event/event-observable";
import { ButtonInput } from "./button-input";

export class ButtonToggleAction {

    readonly onChange = new EventObservable<boolean>();

    private _value: boolean = false;

    get value(): boolean {
        return this._value;
    }

    constructor(inputs: ButtonInput[]) {
        inputs.forEach(it => it.onChange.subscribe(_ => {
            this.toggle();
            this.onChange.produce(this._value);
        }));
    }

    private toggle() {
        this._value = !this._value;
    }
}