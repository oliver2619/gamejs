import { ButtonInput } from "./button-input";
import { Gamepads } from "./gamepads";

export class GamepadButtonInput extends ButtonInput {

    readonly needsStateCheck = true;

    constructor(private readonly device: number, private readonly button: number) {
        super();
    }

    protected readValue() {
        const gamepad = Gamepads.get(this.device);
        if (gamepad != undefined) {
            const button = gamepad.buttons[this.button];
            if (button != undefined) {
                if (button.pressed) {
                    this.buttonDown();
                } else {
                    this.buttonUp();
                }
            }
        }
    }
}