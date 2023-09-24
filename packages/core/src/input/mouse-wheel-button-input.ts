import { ButtonInput } from "./button-input";

export class MouseWheelButtonInput extends ButtonInput {

    readonly needsStateCheck = false;

    private readonly eventProperty: string;

    private readonly wheelCallback = (ev: WheelEvent) => {
        if ((ev as any)[this.eventProperty] * this.direction > 0) {
            this.buttonDown();
            this.buttonUp();
            ev.preventDefault();
        }
    };

    constructor(axis: 'x' | 'y' | 'z', private readonly direction: number) {
        super();
        this.eventProperty = `delta${axis.toUpperCase()}`;
    }

    protected start() {
        document.addEventListener('wheel', this.wheelCallback, { capture: true, passive: false });
    }

    protected stop() {
        document.removeEventListener('wheel', this.wheelCallback, { capture: true });
    }
}