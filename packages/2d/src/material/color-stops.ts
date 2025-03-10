import { Color, ReadonlyColor } from "@pluto/core";

export type ColorStopsArray = Array<{ color: ReadonlyColor; offset: number; }>;

class ColorStop {

    get transparent(): boolean {
        return this.color.a < 1;
    }

    constructor(readonly color: Color, public offset: number) { }
}

export class ColorStops {

    private colorStops: ColorStop[];

    get stops(): ColorStopsArray {
        return this.colorStops.map(it => {
            return { color: it.color, offset: it.offset };
        });
    }

    constructor(data: Readonly<ColorStopsArray>) {
        this.colorStops = data.map(it => new ColorStop(it.color.clone(), it.offset)).sort((s1, s2) => s1.offset - s2.offset);
    }

    isTransparent(): boolean {
        return this.colorStops.some(it => it.transparent);
    }

    removeAt(offset: number) {
        const found = this.colorStops.findIndex(it => it.offset === offset);
        if (found >= 0) {
            this.colorStops.splice(found, 1);
        }
    }

    set(color: ReadonlyColor, offset: number) {
        const found = this.colorStops.findIndex(it => it.offset === offset);
        if (found >= 0) {
            this.colorStops[found]!.color.setColor(color);
        } else {
            this.colorStops.push(new ColorStop(color.clone(), offset));
            this.colorStops.sort((s1, s2) => s1.offset - s2.offset);
        }
    }

    setAll(data: ColorStopsArray) {
        this.colorStops = data.map(it => new ColorStop(it.color.clone(), it.offset))
            .sort((s1, s2) => s1.offset - s2.offset);
    }

    updateGradient(gradient: CanvasGradient) {
        this.colorStops.forEach(it => gradient.addColorStop(it.offset, it.color.toHtmlRgba()));
    }
}