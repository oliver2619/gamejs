import { Gamepads } from "./gamepads";
import { InputControllerFactory } from "./input-controller-factory";
import { InputRecorder, InputRecorderData } from "./input-recorder";

export interface AxisInputRecorderData extends InputRecorderData<number> {
    readonly gamepad: boolean;
    readonly halfAxis?: boolean;
}

export class AxisInputRecorder extends InputRecorder<number> {

    private readonly halfAxis: boolean;

    constructor(data: Readonly<AxisInputRecorderData>) {
        super(data);
        this.halfAxis = data.halfAxis ?? false;
    }

    protected override onPoll() {
        for (let i = 0; i < Gamepads.size; ++i) {
            const g = Gamepads.get(i);
            if (g != undefined) {
                const axes = g.axes;
                for (let a = 0; a < axes.length; ++a) {
                    if (Math.abs(axes[a]!) > 0.1) {
                        if (this.halfAxis) {
                            this.change(InputControllerFactory.gamepadAxis(i, a, axes[a]! < 0 ? -1 : 1));
                        } else {
                            this.change(InputControllerFactory.gamepadAxis(i, a));
                        }
                        return;
                    }
                }
                if (this.halfAxis) {
                    const buttons = g.buttons;
                    for (let b = 0; b < buttons.length; ++b) {
                        if (Math.abs(buttons[b]!.value) > 0.1) {
                            this.change(InputControllerFactory.gamepadButtonAsAxis(i, b));
                            return;
                        }
                    }
                }
            }
        }
    }
}