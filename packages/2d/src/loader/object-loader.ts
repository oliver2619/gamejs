import { ImageResource } from "@pluto/core";
import { NamedObjectMap } from "../scene/object/named-object-map";

export type ObjectLoaderImageMapper = (imageUrl: string) => Promise<ImageResource>;
export type ObjectLoaderPatternMapper = (patternId: string) => Promise<ImageResource>;

export interface ObjectLoaderData {
    readonly imageMapper: ObjectLoaderImageMapper;
    readonly patternMapper: ObjectLoaderPatternMapper;
}

export interface ObjectLoader {
    loadFromUrl(url: string): Promise<NamedObjectMap>;
}

export abstract class StringParsingObjectLoader implements ObjectLoader {

    loadFromUrl(url: string): Promise<NamedObjectMap> {
        return fetch(url, { method: 'GET' }).then(response => response.text()).then(r => this.parse(r));
    }

    abstract parse(input: string): Promise<NamedObjectMap>;
}