import { ObjectLoader, ObjectLoaderData } from "./object-loader";
import { SvgLoader } from "./svg/svg-loader";

export class ObjectLoaderFactory {

    constructor(private readonly data: Readonly<ObjectLoaderData>) { }

    getObjectLoader(url: string): ObjectLoader {
        if (url.toLowerCase().endsWith('.svg')) {
            return new SvgLoader(this.data);
        } else {
            throw new RangeError(`No loader found for loading resource ${url}.`);
        }
    }
}