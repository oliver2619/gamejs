import { Box2d, ReadonlyVector2d } from "@pluto/core";
import { PathObject } from "./path-object";

export class PathBuilder {

    private readonly path = new Path2D();
    private readonly boundingBox = Box2d.empty();

    arcTo(controlPoint: ReadonlyVector2d, target: ReadonlyVector2d, radius: number): PathBuilder {
        this.path.arcTo(controlPoint.x, -controlPoint.y, target.x, -target.y, radius);
        this.boundingBox.extend(controlPoint.x, controlPoint.y);
        this.boundingBox.extend(target.x, target.y);
        return this;
    }

    bezierCurveTo(controlPoint1: ReadonlyVector2d, controlPoint2: ReadonlyVector2d, target: ReadonlyVector2d): PathBuilder {
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

    bone(x1: number, y1: number, r1: number, round1: boolean, x2: number, y2: number, r2: number, round2: boolean): PathBuilder {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const d = Math.sqrt(dx * dx + dy * dy);
        const dr = r1 - r2;
        if (Math.abs(dr) > d || d === 0) {
            if (r1 > r2) {
                if (round1) {
                    this.circle(x1, y1, r1);
                } else if (round2) {
                    this.circle(x2, y2, r2);
                }
            } else {
                if (round2) {
                    this.circle(x2, y2, r2);
                } else if (round1) {
                    this.circle(x1, y1, r1);
                }
            }
            return this;
        }
        const alpha = Math.asin(dr / d);
        const rotation = Math.atan2(dy, dx);
        const sin = dr / d;
        const cos = Math.cos(alpha);
        const tx = dx / d;
        const ty = dy / d;
        const nx = - ty;
        const ny = tx;
        this.moveTo(x2 + tx * r2 * sin + nx * r2 * cos, y2 + ty * r2 * sin + ny * r2 * cos);
        if (round2) {
            this.path.ellipse(x2, -y2, r2, r2, -rotation, Math.PI * 3 / 2 + alpha, Math.PI / 2 - alpha, false);
            this.boundingBox.extend(x2 - r2, y2 - r2);
            this.boundingBox.extend(x2 + r2, y2 + r2);
        } else {
            this.lineTo(x2 + tx * r2 * sin - nx * r2 * cos, y2 + ty * r2 * sin - ny * r2 * cos);
        }
        this.lineTo(x1 + tx * r1 * sin - nx * r1 * cos, y1 + ty * r1 * sin - ny * r1 * cos);
        if (round1) {
            this.path.ellipse(x1, -y1, r1, r1, -rotation, Math.PI / 2 - alpha, Math.PI * 3 / 2 + alpha, false);
            this.boundingBox.extend(x1 - r1, y1 - r1);
            this.boundingBox.extend(x1 + r1, y1 + r1);
        } else {
            this.lineTo(x1 + tx * r1 * sin + nx * r1 * cos, y1 + ty * r1 * sin + ny * r1 * cos);
        }
        this.path.closePath();
        return this;
    }

    circle(x: number, y: number, r: number): PathBuilder {
        this.path.moveTo(x + r, -y);
        this.path.ellipse(x, -y, r, r, 0, 0, Math.PI * 2, false);
        this.boundingBox.extend(x - r, y - r);
        this.boundingBox.extend(x + r, y + r);
        return this;
    }

    closePath(): PathBuilder {
        this.path.closePath();
        return this;
    }

    ellipse(center: ReadonlyVector2d, radius: ReadonlyVector2d, rotation: number): PathBuilder {
        this.path.ellipse(center.x, -center.y, radius.x, radius.y, rotation, 0, Math.PI * 2, false);
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
        this.path.lineTo(x, -y);
        this.boundingBox.extend(x, y);
        return this;
    }

    polygon(points: Array<[number, number]>): PathBuilder {
        points.forEach((pt, i) => {
            if (i === 0) {
                this.moveTo(pt[0], pt[1]);
            } else {
                this.lineTo(pt[0], pt[1]);
            }
        });
        return this;
    }

    polylineTo(points: Array<[number, number]>): PathBuilder {
        points.forEach(pt => this.lineTo(pt[0], pt[1]));
        return this;
    }

    quadraticCurveTo(controlPoint: ReadonlyVector2d, target: ReadonlyVector2d): PathBuilder {
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