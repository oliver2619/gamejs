import { Input } from "./input";

export abstract class AxisInput extends Input<number> {

    private _value = 0;

    get value(): number {
        return this._value;
    }

    reset() {
        this.setValue(0);
    }

    protected setValue(v: number) {
        if (this._value !== v) {
            this._value = v;
            this.onChange.produce(v);
        }
    }
}