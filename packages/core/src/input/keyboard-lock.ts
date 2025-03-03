
export class KeyboardLock {

    private static readonly holders = new Set<any>();
    private static _lock: (() => void) | undefined;
    private static _unlock: (() => void) | undefined;

    private constructor() {
        if ('keyboard' in navigator) {
            const keyboard = navigator.keyboard as any;
            if ('lock' in keyboard && typeof keyboard.lock === 'function') {
                KeyboardLock._lock = () => keyboard.lock().then(() => console.info('Keyboard locked.')).catch((reason: any) => KeyboardLock.logLockError(reason));
            }
            if ('unlock' in keyboard && typeof keyboard.unlock === 'function') {
                KeyboardLock._unlock = () => {
                    keyboard.unlock();
                    console.info('Keyboard unlocked.');
                }
            }
        }
    }

    static lock(holder: any) {
        const wasLocked = this.holders.size > 0;
        this.holders.add(holder);
        if (!wasLocked && this._lock != undefined) {
            this._lock();
        }
    }

    static unlock(holder: any) {
        const wasLocked = this.holders.size > 0;
        this.holders.delete(holder);
        if (this.holders.size === 0 && wasLocked && this._unlock != undefined) {
            this._unlock;
        }
    }

    static logLockError(reason: any) {
        if (reason instanceof Error) {
            console.warn(`Failed to lock keyboard. ${reason.name}: ${reason.message}`);
        } else {
            console.warn(`Failed to lock keyboard. ${reason}`);
        }
    }
}