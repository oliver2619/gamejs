import { GamepadConstants } from "../gamepad-constants";
import { Gamepads } from "../gamepads";
import { InputController } from "../input-controller";
import { ButtonControllerJson, GamepadAxisAsButtonControllerJson } from "../input-controller-json";
import { AbstractButtonController } from "./abstract-button-controller";

export class GamepadAxisAsButtonController extends AbstractButtonController {

    readonly description: string;
    readonly requiresPolling = true;

    private readonly thresholdSquare: number;

    constructor(readonly gamepad: number, readonly axis: number, readonly threshold: number) {
        super();
        this.thresholdSquare = threshold * threshold;
        this.description = `Gamepad ${GamepadConstants.AXIS_STRING[this.axis]} ${this.threshold < 0 ? 'down' : 'up'}`;
    }

    conflictsWith(other: InputController<number | boolean | { readonly x: number, readonly y: number }>): boolean {
        return other.conflictsWithGamepadAxis(this.gamepad, this.axis, this.threshold);
    }

    override conflictsWithGamepadAxis(gamepad: number, axis: number, direction?: number): boolean {
        return this.gamepad === gamepad && this.axis === axis && (direction == undefined || this.threshold * direction > 0);
    }

    override forGamepad(gamepad: number): InputController<boolean> {
        return new GamepadAxisAsButtonController(gamepad, this.axis, this.threshold);
    }

    save(): ButtonControllerJson {
        const ret: GamepadAxisAsButtonControllerJson = {
            type: 'gamepadAxisButton',
            gamepad: this.gamepad,
            axis: this.axis,
            threshold: this.threshold
        };
        return ret;
    }

    protected override updateValueFromPolling(): void {
        const g = Gamepads.get(this.gamepad);
        if (g != undefined) {
            const v = g.axes[this.axis]!;
            this.setValue(v * this.threshold >= this.thresholdSquare);
        }
    }
}

