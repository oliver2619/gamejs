import { Vector2d } from "@pluto/core";
import { PathBuilder } from "./path-builder";
import { PathJson } from "./path-json";
import { PathObject } from "./path-object";

export class PathLoader {

    private constructor() { }

    static load(path: PathJson[]): PathObject {
        const builder = new PathBuilder();
        path.forEach(it => {
            switch (it[0]) {
                case 'arc':
                    builder.arcTo(new Vector2d(it[1], it[2]), new Vector2d(it[3], it[4]), it[5]);
                    break;
                case 'bezier':
                    builder.bezierCurveTo(new Vector2d(it[1], it[2]), new Vector2d(it[3], it[4]), new Vector2d(it[5], it[6]));
                    break;
                case 'bone':
                    builder.bone(it[1], it[2], it[3], it[4], it[5], it[6], it[7], it[8]);
                    break;
                case 'circle':
                    builder.circle(it[1], it[2], it[3]);
                    break;
                case 'close':
                    builder.closePath();
                    break;
                case 'ellipse':
                    builder.ellipse(new Vector2d(it[1], it[2]), new Vector2d(it[3], it[4]), it[5]);
                    break;
                case 'move':
                    builder.moveTo(it[1], it[2]);
                    break;
                case 'line':
                    builder.lineTo(it[1], it[2]);
                    break;
                case 'polygon':
                    builder.polygon(it[1]);
                    break;
                case 'polyline':
                    builder.polylineTo(it[1]);
                    break;
                case 'quadratic':
                    builder.quadraticCurveTo(new Vector2d(it[1], it[2]), new Vector2d(it[3], it[4]));
                    break;
                case 'rect':
                    builder.rectangle(it[1], it[2], it[3], it[4]);
                    break;
                default:
                    throw new Error(`Unknown command ${it[0]}`);
            }
        });
        return builder.build();
    }
}