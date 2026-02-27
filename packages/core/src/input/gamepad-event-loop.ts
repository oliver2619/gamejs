import {  EventObservable, Observable } from "../observable";
import { GamepadButtonEvent } from "./gamepad-button-event";
import { Gamepads } from "./gamepads";

const onButtonDown = new EventObservable<GamepadButtonEvent>(update);
const onButtonUp = new EventObservable<GamepadButtonEvent>(update);
const onPoll = new EventObservable<number>(update);

let timer: number | undefined;
let lastTimestamp = performance.now();
let lastButtonsByGamepad: boolean[][] = [];

function readButtons(): boolean[][] {
    const ret: boolean[][] = [];
    for (let i = 0; i < Gamepads.size; ++i) {
        ret.push(Gamepads.get(i)!.buttons.map(it => it.pressed));
    }
    return ret;
}

function poll(timeout: number) {
    const currentButtonsByGamepad = readButtons();
    for (let gamepadIndex = 0; gamepadIndex < Gamepads.size; ++gamepadIndex) {
        const lastButtons = lastButtonsByGamepad[gamepadIndex];
        const currentButtons = currentButtonsByGamepad[gamepadIndex];
        if (lastButtons != undefined && currentButtons != undefined) {
            currentButtons.forEach((currentButton, buttonIndex) => {
                const lastButton = lastButtons[buttonIndex];
                if (lastButton != undefined) {
                    if (lastButton != currentButton) {
                        if (currentButton) {
                            onButtonDown.next({ gamepad: gamepadIndex, button: buttonIndex });
                        } else {
                            onButtonUp.next({ gamepad: gamepadIndex, button: buttonIndex });
                        }
                    }
                }
            });
        }
    }
    lastButtonsByGamepad = currentButtonsByGamepad;
    onPoll.next(timeout);
}

function start() {
    if (timer == undefined) {
        lastButtonsByGamepad = readButtons();
        lastTimestamp = performance.now();
        timer = window.setInterval(() => {
            const now = performance.now();
            const timeout = (now - lastTimestamp) * 0.001;
            lastTimestamp = now;
            poll(timeout);
        }, 1);
    }
}

function stop() {
    if (timer != undefined) {
        window.clearInterval(timer);
        timer = undefined;
    }
}

function update() {
    const mustRun = (onButtonDown.hasSubscriptions || onButtonUp.hasSubscriptions || onPoll.hasSubscriptions) && Gamepads.size > 0;
    if (mustRun) {
        start();
    } else {
        stop();
    }
}

export class GamepadEventLoop {

    private constructor() { }

    static get onButtonDown(): Observable<GamepadButtonEvent> {
        return onButtonDown;
    }

    static get onButtonUp(): Observable<GamepadButtonEvent> {
        return onButtonUp;
    }

    static get onPoll(): Observable<number> {
        return onPoll;
    }
}

Gamepads.onChange.subscribe(new Object(), update);