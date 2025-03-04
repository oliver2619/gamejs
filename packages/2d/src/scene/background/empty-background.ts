import { RenderingContext2d } from "../../component/rendering-context-2d";
import { Background } from "./background";

export class EmptyBackground extends Background {

    static readonly INSTANCE = new EmptyBackground();

    private constructor() {
        super();
    }

    render(): void {
        RenderingContext2d.current.clear();
    }

    protected onDelete(): void {
    }
}