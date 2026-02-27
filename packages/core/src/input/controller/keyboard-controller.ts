import { InputController } from "../input-controller";
import { ButtonControllerJson, KeyboardControllerJson } from "../input-controller-json";
import { AbstractButtonController } from "./abstract-button-controller";

let keyboardLayoutMap: Map<string, string> | undefined = undefined;

if ('keyboard' in navigator) {
    const keyboard = navigator.keyboard as any;
    if ('getLayoutMap' in keyboard && typeof keyboard.getLayoutMap === 'function') {
        keyboard.getLayoutMap().then((it: Map<string, string>) => keyboardLayoutMap = it);
    }
}

export class KeyboardController extends AbstractButtonController {

    readonly description: string;
    readonly requiresPolling = false;

    private keyDownCallback = (ev: KeyboardEvent) => {
        if (ev.code === this.code) {
            this.setValue(true);
            ev.preventDefault();
        }
    };
    private keyUpCallback = (ev: KeyboardEvent) => {
        if (ev.code === this.code) {
            this.setValue(false);
            ev.preventDefault();
        }
    };

    constructor(private readonly code: string) {
        super();
        if (keyboardLayoutMap == undefined) {
            this.description = code;
        } else {
            this.description = keyboardLayoutMap.get(code) ?? code;
        }
    }

    conflictsWith(other: InputController<number | boolean | { readonly x: number, readonly y: number }>): boolean {
        return other.conflictsWithKeyboard(this.code);
    }

    override conflictsWithKeyboard(code: string): boolean {
        return this.code === code;
    }

    override forGamepad(_gamepad: number): InputController<boolean> {
        return this;
    }

    save(): ButtonControllerJson {
        const ret: KeyboardControllerJson = {
            type: 'keyboard',
            code: this.code
        };
        return ret;
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
