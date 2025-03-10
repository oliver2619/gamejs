import { RenderingContext2d } from "../../component/rendering-context-2d";
import { Background } from "./background";

export class EmptyBackground extends Background {

    render(): void {
        RenderingContext2d.current.clear();
    }

    protected onDelete(): void {
    }
}