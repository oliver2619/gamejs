import {CoordSystem2, CoordSystem2Data} from 'core/src/index';
import {RenderingContext2d} from "../rendering-context2d";

export interface Camera2Data extends CoordSystem2Data {
    readonly zoom?: number;
}

export class Camera2 extends CoordSystem2 {

    zoom = 1;

    constructor(data: Camera2Data) {
        super(data);
        this.zoom = data.zoom == undefined ? 1 : data.zoom;
    }

    use(context: RenderingContext2d) {
        context.context.translate(context.viewportSize.x * 0.5 - this.position.x, context.viewportSize.y - this.position.y);
        context.context.scale(this.zoom, this.zoom);
        // context.transform(1, 0, 0, 1, 0, 0);
    }
}