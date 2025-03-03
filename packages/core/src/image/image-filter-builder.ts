import { Color } from "../color";
import { ImageFilter, ImageFilters } from "./image-filters";
import { ImageObject } from "./image-object";

export class ImageFilterBuilder {

    private filter: ImageFilter | undefined;

    append(filter: ImageFilter): ImageFilterBuilder {
        if (this.filter == undefined) {
            this.filter = filter;
        } else {
            const prev = this.filter;
            this.filter = (input: ImageObject) => {
                const step1 = prev(input);
                return filter(step1);
            };
        }
        return this;
    }

    build(): ImageFilter {
        return this.filter == undefined ? (input: ImageObject) => input : this.filter;
    }

    bump(height: number, distance: number): ImageFilterBuilder {
        return this.append(ImageFilters.bump(height, distance));
    }

    colorMapping(mapping: (c: Color) => Color): ImageFilterBuilder {
        return this.append(ImageFilters.colorMapping(mapping));
    }

    flipY(): ImageFilterBuilder {
        return this.append(ImageFilters.flipY());
    }

    removeAlpha(): ImageFilterBuilder {
        return this.append(ImageFilters.removeAlpha());
    }
}