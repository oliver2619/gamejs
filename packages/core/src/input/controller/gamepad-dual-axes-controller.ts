import { Gamepads } from "../gamepads";
import { DualAxesController, InputController } from "../input-controller";
import { GamepadDualAxesControllerJson } from "../input-controller-json";
import { AbstractInputController } from "./abstract-input-controller";

export class GamepadDualAxesController extends AbstractInputController<{ readonly x: number, readonly y: number }> implements DualAxesController {

    override readonly description: string;
    override readonly isButton = false;
    override readonly requiresPolling = true;

    private readonly axisX: number;
    private readonly axisY: number;

    constructor(private readonly gamepad: number, axis: number) {
        super({ x: 0, y: 0 });
        this.axisX = axis & (-2);
        this.axisY = this.axisX + 1;
        this.description = `Gamepad ${this.axisX === 0 ? 'left' : 'right'} axes`;
    }

    override conflictsWith(other: InputController<number | boolean>): boolean {
        return other.conflictsWithGamepadAxis(this.gamepad, this.axisX) || other.conflictsWithGamepadAxis(this.gamepad, this.axisY);
    }

    override conflictsWithGamepadAxis(gamepad: number, axis: number, _?: number): boolean {
        return this.gamepad === gamepad && (this.axisX === axis || this.axisY === axis);
    }

    override forGamepad(gamepad: number): InputController<{ readonly x: number; readonly y: number; }> {
        return new GamepadDualAxesController(gamepad, this.axisX);
    }

    override reset(): void {
        this.setValue({ x: 0, y: 0 });
    }

    save(): GamepadDualAxesControllerJson {
        return {
            axis: this.axisX,
            gamepad: this.gamepad,
            type: 'gamepadDualAxes',
        };
    }

    protected override updateValueFromPolling(): void {
        const g = Gamepads.get(this.gamepad);
        if (g != undefined) {
            const x = g.axes[this.axisX]!;
            const y = g.axes[this.axisY]!;
            this.setValue({ x, y });
        }
    }
}