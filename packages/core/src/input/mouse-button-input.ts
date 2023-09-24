import { ButtonInput } from "./button-input";

export class MouseButtonInput extends ButtonInput {

    readonly needsStateCheck = false;

    private readonly mouseDownCallback = (ev: MouseEvent) => {
        if (ev.button === this.button) {
            this.buttonDown();
            ev.preventDefault();
        }
    };
    private readonly mouseUpCallback = (ev: MouseEvent) => {
        if (ev.button === this.button) {
            this.buttonUp();
            ev.preventDefault();
        }
    };

    constructor(private readonly button: number) {
        super();
    }

    protected start() {
        document.addEventListener('mousedown', this.mouseDownCallback, { capture: true, passive: false });
        document.addEventListener('mouseup', this.mouseUpCallback, { capture: true, passive: false });
    }

    protected stop() {
        document.removeEventListener('mousedown', this.mouseDownCallback, { capture: true });
        document.removeEventListener('mouseup', this.mouseUpCallback, { capture: true });
    }
}