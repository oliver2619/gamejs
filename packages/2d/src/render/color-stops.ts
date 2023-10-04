import { Color, EventObservable, ReadonlyColor } from "core/src/index";

export type ColorStopsArray = Array<{ color: ReadonlyColor; offset: number; }>;

export interface ColorStopsData {

    readonly stops: ColorStopsArray;
}

class ColorStop {

    get transparent(): boolean {
        return this.color.a < 1;
    }

    constructor(readonly color: Color, public offset: number) { }

}

export class ColorStops {

    readonly onModify = new EventObservable<void>();

    private colorStops: ColorStop[];

    get stops(): ColorStopsArray {
        return this.colorStops.map(it => {
            return { color: it.color, offset: it.offset };
        });
    }

    constructor(data: ColorStopsData) {
        this.colorStops = data.stops.map(it => new ColorStop(it.color.clone(), it.offset)).sort((s1, s2) => s1.offset - s2.offset);
    }

    isTransparent(): boolean {
        return this.colorStops.some(it => it.transparent);
    }

    removeAt(offset: number) {
        const found = this.colorStops.findIndex(it => it.offset === offset);
        if (found >= 0) {
            this.colorStops.splice(found, 1);
            this.onModify.produce();
        }
    }

    set(color: ReadonlyColor, offset: number) {
        const found = this.colorStops.findIndex(it => it.offset === offset);
        if (found >= 0) {
            this.colorStops[found].color.setColor(color);
        } else {
            this.colorStops.push(new ColorStop(color.clone(), offset));
            this.colorStops.sort((s1, s2) => s1.offset - s2.offset);
        }
        this.onModify.produce();
    }

    setAll(data: ColorStopsArray) {
        this.colorStops = data.map(it => new ColorStop(it.color.clone(), it.offset))
            .sort((s1, s2) => s1.offset - s2.offset);
        this.onModify.produce();
    }

    updateGradient(gradient: CanvasGradient) {
        this.colorStops.forEach(it => gradient.addColorStop(it.offset, it.color.toHtmlRgba()));
    }
}