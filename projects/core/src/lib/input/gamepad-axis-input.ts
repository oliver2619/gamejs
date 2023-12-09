import { AxisInput } from "./axis-input";
import { Gamepads } from "./gamepads";

export class GamepadAxisInput extends AxisInput {

    readonly needsStateCheck = true;

    constructor(private readonly gamepad: number, private readonly axis: number) {
        super();
    }

    protected override readValue() {
        const g = Gamepads.get(this.gamepad);
        if (g != undefined) {
            const v = g.axes[this.axis];
            this.setValue(v);
        }
    }
}