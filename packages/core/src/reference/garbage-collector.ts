class GCItem {
    constructor(public readonly object: any, public readonly onDispose: () => void) {
    }
}

export class GarbageCollector {

    private static readonly items: GCItem[] = [];

    static processAll() {
        while (this.items.length > 0) {
            this.items.forEach(it => it.onDispose());
            this.items.splice(0, this.items.length);
        }
    }

    static processOne() {
        const next = this.items.shift();
        if (next != undefined) {
            next.onDispose();
        }
    }

    static recycleObject(object: any) {
        const found = this.items.findIndex(it => it.object === object);
        if (found >= 0) {
            this.items.splice(found, 1);
        }
    }

    static scheduleObjectForDisposal(object: any, onDispose: () => void) {
        this.items.push(new GCItem(object, onDispose));
    }
}