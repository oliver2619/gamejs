import { ButtonInput } from "./button-input";

export class KeyButtonInput extends ButtonInput {

    readonly needsStateCheck = false;

    private keyDownCallback = (ev: KeyboardEvent) => {
        if (ev.code === this.key) {
            this.buttonDown();
            ev.preventDefault();
        }
    };
    private keyUpCallback = (ev: KeyboardEvent) => {
        if (ev.code === this.key) {
            this.buttonUp();
            ev.preventDefault();
        }
    };

    constructor(private readonly key: string) {
        super();
    }

    protected override start(): void {
        document.addEventListener('keydown', this.keyDownCallback, { capture: true, passive: false });
        document.addEventListener('keyup', this.keyUpCallback, { capture: true, passive: false });
    }

    protected override stop(): void {
        document.removeEventListener('keydown', this.keyDownCallback, { capture: true });
        document.removeEventListener('keyup', this.keyUpCallback, { capture: true });
    }

}