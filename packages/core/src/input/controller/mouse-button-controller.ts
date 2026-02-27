import { InputController } from "../input-controller";
import { ButtonControllerJson, MouseControllerJson } from "../input-controller-json";
import { AbstractButtonController } from "./abstract-button-controller";

export class MouseButtonController extends AbstractButtonController {

    readonly description: string;
    readonly requiresPolling = false;

    private readonly mouseDownCallback = (ev: MouseEvent) => {
        if (ev.button === this.button) {
            this.setValue(true);
            ev.preventDefault();
        }
    };
    private readonly mouseUpCallback = (ev: MouseEvent) => {
        if (ev.button === this.button) {
            this.setValue(false);
            ev.preventDefault();
        }
    };

    constructor(private readonly button: number) {
        super();
        this.description = `Mouse${this.button + 1}`;
    }

    conflictsWith(other: InputController<number | boolean | {readonly x: number, readonly y: number}>): boolean {
        return other.conflictsWithMouseButton(this.button);
    }

    override conflictsWithMouseButton(button: number): boolean {
        return this.button === button;
    }

    override forGamepad(_gamepad: number): InputController<boolean> {
        return this;
    }

    save(): ButtonControllerJson {
        const ret: MouseControllerJson = {
            type: 'mouse',
            button: this.button
        };
        return ret;
    }

    protected override start() {
        document.addEventListener('mousedown', this.mouseDownCallback, { capture: true, passive: false });
        document.addEventListener('mouseup', this.mouseUpCallback, { capture: true, passive: false });
    }

    protected override stop() {
        document.removeEventListener('mousedown', this.mouseDownCallback, { capture: true });
        document.removeEventListener('mouseup', this.mouseUpCallback, { capture: true });
    }
}
