import { ImageResource } from "@pluto/core";
import { Object2d } from "../scene/object/object-2d";

export type Object2dLoaderImageMapper = (imageUrl: string) => Promise<ImageResource>;
export type Object2dLoaderPatternMapper = (patternId: string) => Promise<ImageResource>;

export interface Object2dLoaderData {
    imageMapper: Object2dLoaderImageMapper;
    patternMapper: Object2dLoaderPatternMapper;
    baseUrl?: string;
}

export interface Object2dLoader {
    loadObject(url: string): Promise<Object2d>;
}
