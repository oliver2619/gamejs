import { Observable } from "../observable";
import { EventObservable } from "../observable/event-observable";

const gamepads: number[] = [];
const onChange = new EventObservable<void>();

export class Gamepads {

    static get onChange(): Observable<void> {
        return onChange;
    }

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
    onChange.next();
}

window.addEventListener('gamepadconnected', (_: GamepadEvent) => updateGamepads());
window.addEventListener('gamepaddisconnected', (_: GamepadEvent) => updateGamepads());