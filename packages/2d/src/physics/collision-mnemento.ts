export class CollisionMnemento {

    private collisionActions: Array<() => void> = [];

    get hasCollisions(): boolean {
        return this.collisionActions.length > 0;
    }

    get timeout(): number {
        return this._timeout;
    }

    constructor(private _timeout: number) { }

    add(timeout: number, action: () => void) {
        if (timeout >= 0 && timeout <= this._timeout) {
            if (timeout < this._timeout) {
                this.collisionActions.splice(0, this.collisionActions.length);
            }
            this.collisionActions.push(action);
        }
    }

    processCollisions() {
        this.collisionActions.forEach(it => it());
    }
}