import { ImageResource } from "@pluto/core";
import { LineStyleData } from "../../material";

export interface SvgPort {
    getColorStyle<P>(): P;
    getImage(url: string): Promise<ImageResource>;
    getLineStyle<L>(style: LineStyleData): L;
    getLinearGradientStyle<P>(): P;
    getMaterial<M>(): M;
    getPatternStyle<P>(): Promise<P>;
    getRadialGradientStyle<P>(): P;
}