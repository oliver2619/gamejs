import { GamepadConstants } from "../gamepad-constants";
import { Gamepads } from "../gamepads";
import { InputController } from "../input-controller";
import { ButtonControllerJson, GamepadButtonControllerJson } from "../input-controller-json";
import { AbstractButtonController } from "./abstract-button-controller";

export class GamepadButtonController extends AbstractButtonController {

    readonly requiresPolling = true;
    readonly description: string;

    constructor(readonly gamepad: number, readonly button: number) {
        super();
        this.description = `Gamepad ${GamepadConstants.BUTTON_STRING[this.button]}`;
    }

    conflictsWith(other: InputController<number | boolean>): boolean {
        return other.conflictsWithGamepadButton(this.gamepad, this.button);
    }

    override conflictsWithGamepadButton(gamepad: number, button: number): boolean {
        return this.gamepad === gamepad && this.button === button;
    }

    save(): ButtonControllerJson {
        const ret: GamepadButtonControllerJson = {
            type: 'gamepadButton',
            gamepad: this.gamepad,
            button: this.button
        };
        return ret;
    }

    protected override updateValueFromPolling(): void {
        const gamepad = Gamepads.get(this.gamepad);
        if (gamepad != undefined) {
            const button = gamepad.buttons[this.button];
            if (button != undefined) {
                this.setValue(button.pressed);
            }
        }
    }
}

