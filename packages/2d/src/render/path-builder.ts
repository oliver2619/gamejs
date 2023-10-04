import { Box2, ReadonlyVector2 } from "core/src/index";
import { PathObject } from "./path-object";

export class PathBuilder {

    private readonly path = new Path2D();
    private readonly boundingBox = Box2.empty();

    arcTo(controlPoint: ReadonlyVector2, target: ReadonlyVector2, radius: number): PathBuilder {
        this.path.arcTo(controlPoint.x, -controlPoint.y, target.x, -target.y, radius);
        this.boundingBox.extend(controlPoint.x, controlPoint.y);
        this.boundingBox.extend(target.x, target.y);
        return this;
    }

    bezierCurveTo(controlPoint1: ReadonlyVector2, controlPoint2: ReadonlyVector2, target: ReadonlyVector2): PathBuilder {
        this.path.bezierCurveTo(controlPoint1.x, -controlPoint1.y, controlPoint2.x, -controlPoint2.y, target.x, -target.y);
        this.boundingBox.extend(controlPoint1.x, controlPoint1.y);
        this.boundingBox.extend(controlPoint2.x, controlPoint2.y);
        this.boundingBox.extend(target.x, target.y);
        return this;
    }

    build(): PathObject {
        if (this.boundingBox.isEmpty) {
            throw new Error('Path is empty');
        }
        return new PathObject(this.path, this.boundingBox.clone());
    }

    circle(x: number, y: number, r: number): PathBuilder {
        this.path.ellipse(x, -y, r, r, 0, 0, Math.PI * 2);
        this.boundingBox.extend(x - r, y - r);
        this.boundingBox.extend(x + r, y + r);
        return this;
    }

    closePath(): PathBuilder {
        this.path.closePath();
        return this;
    }

    ellipse(center: ReadonlyVector2, radius: ReadonlyVector2, rotation: number): PathBuilder {
        this.path.ellipse(center.x, -center.y, radius.x, radius.y, rotation, 0, Math.PI * 2);
        const r = Math.max(radius.x, radius.y);
        this.boundingBox.extend(center.x - r, center.y - r);
        this.boundingBox.extend(center.x + r, center.y + r);
        return this;
    }

    moveTo(x: number, y: number): PathBuilder {
        this.path.moveTo(x, -y);
        this.boundingBox.extend(x, y);
        return this;
    }

    lineTo(x: number, y: number): PathBuilder {
        this.path.lineTo(x, y);
        this.boundingBox.extend(x, y);
        return this;
    }

    quadraticCurveTo(controlPoint: ReadonlyVector2, target: ReadonlyVector2): PathBuilder {
        this.path.quadraticCurveTo(controlPoint.x, -controlPoint.y, target.x, -target.y);
        this.boundingBox.extend(controlPoint.x, controlPoint.y);
        this.boundingBox.extend(target.x, target.y);
        return this;
    }

    rectangle(x: number, y: number, width: number, height: number): PathBuilder {
        this.path.rect(x, -y - height + 1, width, height);
        this.boundingBox.extend(x, y);
        this.boundingBox.extend(x + width - 1, y + height - 1);
        return this;
    }
}