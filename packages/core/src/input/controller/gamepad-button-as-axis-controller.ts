import { GamepadConstants } from "../gamepad-constants";
import { Gamepads } from "../gamepads";
import { InputController } from "../input-controller";
import { AxisControllerJson, GamepadButtonAsAxisControllerJson } from "../input-controller-json";
import { AbstractAxisController } from "./abstract-axis-controller";

export class GamepadButtonAsAxisController extends AbstractAxisController {

    readonly description: string;
    readonly requiresPolling = true;

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

    save(): AxisControllerJson {
        const ret: GamepadButtonAsAxisControllerJson = {
            type: 'gamepadButtonAxis',
            gamepad: this.gamepad,
            button: this.button
        };
        return ret;
    }

    protected override updateValueFromPolling(): void {
        const g = Gamepads.get(this.gamepad);
        if (g != undefined) {
            const v = g.buttons[this.button]!;
            this.setValue(v.value);
        }
    }
}

