import { Input } from "./input";

export abstract class ButtonInput extends Input<boolean> {

    private _value = false;

    get value(): boolean {
        return this._value;
    }

    reset() {
        this.buttonUp();
    }

    protected buttonDown() {
        if(!this._value) {
            this._value = true;
            this.onChange.produce(this._value);
        }
    }

    protected buttonUp() {
        if(this._value) {
            this._value = false;
            this.onChange.produce(this._value);
        }
    }
}
