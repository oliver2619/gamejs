import { InputController } from "../input-controller";
import { ButtonControllerJson, MouseWheelControllerJson } from "../input-controller-json";
import { AbstractButtonController } from "./abstract-button-controller";

export class MouseWheelAsButtonController extends AbstractButtonController {

    readonly description: string;
    readonly requiresPolling = false;

    private readonly eventProperty: string;

    private readonly wheelCallback = (ev: WheelEvent) => {
        if ((ev as any)[this.eventProperty] * this.direction > 0) {
            this.setValue(true);
            this.setValue(false);
            ev.preventDefault();
        }
    };

    constructor(private readonly axis: 'x' | 'y' | 'z', private readonly direction: number) {
        super();
        this.eventProperty = `delta${axis.toUpperCase()}`;
        this.description = `Wheel${this.axis.toUpperCase()} ${this.direction < 0 ? 'down' : 'up'}`;
    }

    conflictsWith(other: InputController<number | boolean | { readonly x: number, readonly y: number }>): boolean {
        return other.conflictsWithMouseWheel(this.axis);
    }

    override conflictsWithMouseWheel(axis: "x" | "y" | "z"): boolean {
        return this.axis === axis;
    }

    override forGamepad(_gamepad: number): InputController<boolean> {
        return this;
    }

    save(): ButtonControllerJson {
        const ret: MouseWheelControllerJson = {
            type: 'mouseWheel',
            axis: this.axis,
            direction: this.direction
        };
        return ret;
    }

    protected override start() {
        document.addEventListener('wheel', this.wheelCallback, { capture: true, passive: false });
    }

    protected override stop() {
        document.removeEventListener('wheel', this.wheelCallback, { capture: true });
    }
}

