import { EventObservable } from "../observable/event-observable";

const gamepads: number[] = [];

export class Gamepads {

    static readonly onChange = new EventObservable<void>();

    static get size(): number {
        return gamepads.length;
    }

    static get(index: number): Gamepad {
        if (index < 0 || index >= gamepads.length) {
            throw new RangeError(`Index ${index} out of bounds.`);
        }
        const ret = navigator.getGamepads()[gamepads[index]!];
        if (ret == null) {
            throw new RangeError(`Gamepad ${index} not found.`);
        }
        return ret;
    }
}

function updateGamepads() {
    gamepads.splice(0, gamepads.length);
    navigator.getGamepads().forEach((it, ix) => {
        if (it != null) {
            gamepads.push(ix);
        }
    });
    Gamepads.onChange.next();
}

window.addEventListener('gamepadconnected', (_: GamepadEvent) => updateGamepads());
window.addEventListener('gamepaddisconnected', (_: GamepadEvent) => updateGamepads());