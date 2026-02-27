import { GamepadButtonEvent } from "./gamepad-button-event";
import { GamepadConstants } from "./gamepad-constants";
import { GamepadEventLoop } from "./gamepad-event-loop";
import { Gamepads } from "./gamepads";
import { InputRecorder } from "./input-recorder";

const offset = { x: 0, y: 0 };
const position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

let visible = false;
let element: HTMLElement | undefined;
let subscriber: Object | undefined;
let speed = 100;
let hasMouseMoveListener = false;
let aButtonDownElement: Element | undefined;

function setPosition(x: number, y: number) {
    position.x = Math.max(0, Math.min(window.innerWidth, x));
    position.y = Math.max(0, Math.min(window.innerHeight, y));
    if (element != undefined) {
        element.style.left = `${Math.round(position.x - offset.x)}px`;
        element.style.top = `${Math.round(position.y - offset.y)}px`;
    }
}

function onPoll(timeout: number) {
    if (InputRecorder.active != undefined) {
        return;
    }
    const g = Gamepads.get(0);
    const gx = g.axes[GamepadConstants.AXIS_LEFT_X] ?? 0;
    const gy = g.axes[GamepadConstants.AXIS_LEFT_Y] ?? 0;
    if (gx * gx + gy * gy > 0.05 * 0.05) {
        const x = position.x + gx * speed * timeout;
        const y = position.y + gy * speed * timeout;
        setPosition(x, y);
    }
    const sx = g.axes[GamepadConstants.AXIS_RIGHT_X] ?? 0;
    const sy = g.axes[GamepadConstants.AXIS_RIGHT_Y] ?? 0;
    if (sx * sx + sy * sy > 0.05 * 0.05) {
        document.elementsFromPoint(position.x, position.y).forEach(it => it.scrollBy(sx * speed * timeout, sy * speed * timeout));
    }
}

function onButtonDown(ev: GamepadButtonEvent) {
    if (InputRecorder.active != undefined) {
        return;
    }
    if (ev.button === GamepadConstants.BUTTON_A) {
        aButtonDownElement = document.elementFromPoint(position.x, position.y) ?? undefined;
    }
}

function onButtonUp(ev: GamepadButtonEvent) {
    if (InputRecorder.active != undefined) {
        return;
    }
    const el = document.elementFromPoint(position.x, position.y);
    if (ev.button === GamepadConstants.BUTTON_A) {
        if (el === aButtonDownElement) {
            if (el instanceof HTMLInputElement || el instanceof HTMLButtonElement || el instanceof HTMLAnchorElement || el instanceof HTMLSelectElement) {
                el.focus();
            }
            if (el instanceof HTMLElement) {
                el.click();
            }
        }
    } else {
        const cev = new CustomEvent<GamepadButtonEvent>('gamepad-mouse-click', { bubbles: true, cancelable: true, detail: ev });
        if (el != null) {
            el.dispatchEvent(cev);
        } else {
            document.dispatchEvent(cev);
        }
    }
}

function onMouseMove(ev: MouseEvent) {
    setPosition(ev.clientX, ev.clientY);
}

function start() {
    if (subscriber == undefined) {
        subscriber = new Object();
        GamepadEventLoop.onButtonDown.subscribe(subscriber, onButtonDown);
        GamepadEventLoop.onButtonUp.subscribe(subscriber, onButtonUp);
        GamepadEventLoop.onPoll.subscribe(subscriber, onPoll);
        setPosition(position.x, position.y);
    }
}

function stop() {
    if (subscriber != undefined) {
        GamepadEventLoop.onButtonDown.unsubscribe(subscriber);
        GamepadEventLoop.onButtonUp.unsubscribe(subscriber);
        GamepadEventLoop.onPoll.unsubscribe(subscriber);
        subscriber = undefined;
    }
}

function update() {
    const mustRun = visible && element != undefined && Gamepads.size > 0;
    if (mustRun) {
        start();
    } else {
        stop();
    }
    if (element != undefined) {
        element.style.visibility = mustRun ? 'visible' : 'hidden';
    }
    const needsMouseMoveListener = Gamepads.size > 0;
    if (needsMouseMoveListener && !hasMouseMoveListener) {
        document.addEventListener('mousemove', onMouseMove, { capture: true, passive: false });
        hasMouseMoveListener = true;
    } else if (!needsMouseMoveListener && hasMouseMoveListener) {
        document.removeEventListener('mousemove', onMouseMove);
        hasMouseMoveListener = false;
    }
}

export class GamepadMouse {

    static set speed(s: number) {
        speed = s;
    }

    static get visible(): boolean {
        return visible;
    }

    static set visible(v: boolean) {
        visible = v;
        update();
    }

    private constructor() { }

    static attachCursor(el: HTMLElement, offsetX: number, offsetY: number) {
        element = el;
        element.style.pointerEvents = 'none';
        element.style.position = 'fixed';
        offset.x = offsetX;
        offset.y = offsetY;
        update();
    }

    static detachCursor() {
        element = undefined;
        update();
    }
}

Gamepads.onChange.subscribe(new Object(), update);