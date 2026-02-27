import { GamepadButtonEvent } from "./gamepad-button-event";
import { Gamepads } from "./gamepads";
import { InputControllerFactory } from "./input-controller-factory";
import { InputRecorder, InputRecorderData } from "./input-recorder";

export interface ButtonInputRecorderData extends InputRecorderData<boolean> {
    readonly mouse?: boolean;
    readonly keyboard?: boolean;
    readonly gamepad?: boolean;
    readonly axisThreshold?: number;
}

export class ButtonInputRecorder extends InputRecorder<boolean> {

    private readonly mouse: boolean;
    private readonly keyboard: boolean;
    private readonly gamepad: boolean;
    private readonly axisThreshold: number;

    constructor(data: Readonly<ButtonInputRecorderData>) {
        super(data);
        this.mouse = data.mouse ?? false;
        this.keyboard = data.keyboard ?? false;
        this.gamepad = data.gamepad ?? false;
        this.axisThreshold = data.axisThreshold ?? 0.5;
    }

    protected override onKeyDown(code: string) {
        if (this.keyboard) {
            this.change(InputControllerFactory.keyboard(code));
        }
    }

    protected override onMouseDown(button: number): void {
        if (this.mouse) {
            this.change(InputControllerFactory.mouseButton(button))
        }
    }

    protected override onMouseWheel(wheel: "x" | "y" | "z", direction: number): void {
        if (this.mouse) {
            this.change(InputControllerFactory.mouseWheelAsButton(wheel, direction));
        }
    }

    protected override onGamepadButton(ev: GamepadButtonEvent): void {
        if (this.gamepad) {
            this.change(InputControllerFactory.gamepadButton(ev.gamepad, ev.button))
        }
    }

    protected override onPoll() {
        if(this.gamepad) {
            for (let gamepadIndex = 0; gamepadIndex < Gamepads.size; ++gamepadIndex) {
                const gamepad = Gamepads.get(gamepadIndex);
                if (gamepad != undefined) {
                    const axes = gamepad.axes;
                    for (let a = 0; a < axes.length; ++a) {
                        if (Math.abs(axes[a]!) >= this.axisThreshold) {
                            this.change(InputControllerFactory.gamepadAxisAsButton(gamepadIndex, a, axes[a]! < 0 ? -this.axisThreshold : this.axisThreshold));
                            return;
                        }
                    }
                }
            }
        }
    }
}