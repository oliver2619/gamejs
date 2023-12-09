import { EventObservable } from "../event/event-observable";

const gamepads: number[] = [];

export class Gamepads {

    static readonly onChange = new EventObservable<void>();

    static get size(): number {
        return gamepads.length;
    }

    static get(index: number): Gamepad | undefined {
        const ret = navigator.getGamepads()[gamepads[index]];
        return ret == null ? undefined : ret;
    }
}

function updateGamepads() {
    gamepads.splice(0, gamepads.length);
    navigator.getGamepads().forEach((it, ix) => {
        if (it != null) {
            gamepads.push(ix);
        }
    });
    Gamepads.onChange.produce();
}

window.addEventListener('gamepadconnected', (e: GamepadEvent) => updateGamepads());
window.addEventListener('gamepaddisconnected', (e: GamepadEvent) => updateGamepads());