import { GamepadConstants } from "../gamepad-constants";
import { Gamepads } from "../gamepads";
import { InputController } from "../input-controller";
import { AxisControllerJson, GamepadAxisControllerJson } from "../input-controller-json";
import { AbstractAxisController } from "./abstract-axis-controller";

export class GamepadAxisController extends AbstractAxisController {

    readonly requiresPolling = true;
    readonly description: string;

    readonly direction: number | undefined;

    constructor(readonly gamepad: number, readonly axis: number, direction: number | undefined) {
        super();
        this.direction = direction == undefined ? undefined : (direction < 0 ? -1 : 1);
        const axisString = GamepadConstants.AXIS_STRING[this.axis]!;
        this.description = this.direction == undefined ? `Gamepad ${axisString}` : `Gamepad ${axisString} ${this.direction < 0 ? 'down' : 'up'}`;
    }

    conflictsWith(other: InputController<number | boolean | {readonly x: number, readonly y: number}>): boolean {
        return other.conflictsWithGamepadAxis(this.gamepad, this.axis, this.direction);
    }

    override conflictsWithGamepadAxis(gamepad: number, axis: number, direction?: number): boolean {
        return this.gamepad === gamepad && this.axis === axis && (this.direction == undefined || direction == undefined || this.direction * direction > 0);
    }

    override forGamepad(gamepad: number): InputController<number> {
        return new GamepadAxisController(gamepad, this.axis, this.direction);
    }

    save(): AxisControllerJson {
        const ret: GamepadAxisControllerJson = {
            type: 'gamepadAxis',
            gamepad: this.gamepad,
            axis: this.axis,
            direction: this.direction
        };
        return ret;
    }

    protected override updateValueFromPolling(): void {
        const g = Gamepads.get(this.gamepad);
        if (g != undefined) {
            const v = this.direction == undefined ? g.axes[this.axis]! : Math.max(0, g.axes[this.axis]! * this.direction);
            this.setValue(v);
        }
    }
}
