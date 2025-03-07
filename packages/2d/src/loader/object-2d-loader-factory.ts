import { Object2dLoader, Object2dLoaderData } from "./object-2d-loader";
import { SvgLoader } from "./svg/svg-loader";

export class Object2dLoaderFactory {

    constructor(private readonly data: Readonly<Object2dLoaderData>) { }

    getObjectLoader(url: string): Object2dLoader {
        if (url.toLowerCase().endsWith('.svg')) {
            return new SvgLoader(this.data);
        } else {
            throw new RangeError(`No loader found for loading resource ${url}.`);
        }
    }
}