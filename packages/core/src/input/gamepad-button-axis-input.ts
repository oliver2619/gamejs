import { AxisInput } from "./axis-input";
import { Gamepads } from "./gamepads";

export class GamepadButtonAxisInput extends AxisInput {

    readonly needsStateCheck = true;

    constructor(private readonly gamepad: number, private readonly button: number) {
        super();
    }

    protected readValue() {
        const g = Gamepads.get(this.gamepad);
        if (g != undefined) {
            const v = g.buttons[this.button];
            this.setValue(v.value);
        }
    }
}