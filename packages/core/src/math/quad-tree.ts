import { Box2, ReadonlyBox2 } from "./box2";
import { ReadonlyVector2, Vector2 } from "./vector2";

abstract class QuadTreeItem<E> {

    constructor(public element: E) { }

    abstract extendBoundingBox(box: Box2): void;

    abstract insert(node: QuadTreeNode<E>): void;

    abstract intersects(box: ReadonlyBox2): boolean;
}

class QuadTreeSolidItem<E> extends QuadTreeItem<E> {

    constructor(element: E, public readonly boundingBox: Box2) {
        super(element);
    }

    extendBoundingBox(box: Box2) {
        box.extendByBox(this.boundingBox);
    }

    insert(node: QuadTreeNode<E>) {
        node.findRecursivelyForBoundingBox(this.boundingBox).solids.push(this);
    }

    intersects(box: ReadonlyBox2): boolean {
        return box.intersectsBox(this.boundingBox);
    }
}

class QuadTreePointItem<E> extends QuadTreeItem<E> {

    constructor(element: E, public position: Vector2) {
        super(element);
    }

    extendBoundingBox(box: Box2) {
        box.extendByPoint(this.position);
    }

    insert(node: QuadTreeNode<E>) {
        node.findRecursivelyForPoint(this.position).points.push(this);
    }

    intersects(box: ReadonlyBox2): boolean {
        return box.intersectsPoint(this.position);
    }
}

class QuadTreeNode<E> {
    position: Vector2 = new Vector2(0, 0);
    solids: Array<QuadTreeSolidItem<E>> = [];
    points: Array<QuadTreePointItem<E>> = [];
    childX1Y1: QuadTreeNode<E> | undefined;
    childX2Y1: QuadTreeNode<E> | undefined;
    childX1Y2: QuadTreeNode<E> | undefined;
    childX2Y2: QuadTreeNode<E> | undefined;

    constructor(depth: number) {
        if (depth > 0) {
            this.childX1Y1 = new QuadTreeNode(depth - 1);
            this.childX2Y1 = new QuadTreeNode(depth - 1);
            this.childX1Y2 = new QuadTreeNode(depth - 1);
            this.childX2Y2 = new QuadTreeNode(depth - 1);
        }
    }

    clear() {
        this.solids = [];
        this.points = [];
        if (this.childX1Y1 !== undefined)
            this.childX1Y1.clear();
        if (this.childX2Y1 !== undefined)
            this.childX2Y1.clear();
        if (this.childX1Y2 !== undefined)
            this.childX1Y2.clear();
        if (this.childX2Y2 !== undefined)
            this.childX2Y2.clear();
    }

    findChildForBoundingBox(box: ReadonlyBox2): QuadTreeNode<E> {
        const min = box.minimum;
        const max = box.maximum;
        if (min == undefined || max == undefined) {
            return this;
        }
        if (max.x < this.position.x) {
            if (max.y < this.position.y && this.childX1Y1 !== undefined) {
                return this.childX1Y1;
            } else if (min.y > this.position.y && this.childX1Y2 !== undefined) {
                return this.childX1Y2;
            } else
                return this;
        } else if (min.x > this.position.x) {
            if (max.y < this.position.y && this.childX2Y1 !== undefined) {
                return this.childX2Y1;
            } else if (min.y > this.position.y && this.childX2Y2 !== undefined) {
                return this.childX2Y2;
            } else
                return this;
        } else
            return this;
    }

    findRecursivelyForBoundingBox(box: ReadonlyBox2): QuadTreeNode<E> {
        const min = box.minimum;
        const max = box.maximum;
        if (min == undefined || max == undefined) {
            return this;
        }
        if (max.x < this.position.x) {
            if (max.y < this.position.y && this.childX1Y1 !== undefined) {
                return this.childX1Y1.findRecursivelyForBoundingBox(box);
            } else if (min.y > this.position.y && this.childX1Y2 !== undefined) {
                return this.childX1Y2.findRecursivelyForBoundingBox(box);
            } else
                return this;
        } else if (min.x > this.position.x) {
            if (max.y < this.position.y && this.childX2Y1 !== undefined) {
                return this.childX2Y1.findRecursivelyForBoundingBox(box);
            } else if (min.y > this.position.y && this.childX2Y2 !== undefined) {
                return this.childX2Y2.findRecursivelyForBoundingBox(box);
            } else
                return this;
        } else
            return this;
    }

    findRecursivelyForPoint(position: ReadonlyVector2): QuadTreeNode<E> {
        if (position.x < this.position.x) {
            if (position.y < this.position.y && this.childX1Y1 !== undefined) {
                return this.childX1Y1;
            } else if (position.y > this.position.y && this.childX1Y2 !== undefined) {
                return this.childX1Y2;
            } else
                return this;
        } else if (position.x > this.position.x) {
            if (position.y < this.position.y && this.childX2Y1 !== undefined) {
                return this.childX2Y1;
            } else if (position.y > this.position.y && this.childX2Y2 !== undefined) {
                return this.childX2Y2;
            } else
                return this;
        } else
            return this;
    }

    forEach(visitor: (element: E) => any) {
        this.solids.forEach(e => visitor(e.element));
        this.points.forEach(e => visitor(e.element));
        if (this.childX1Y1 !== undefined)
            this.childX1Y1.forEach(visitor);
        if (this.childX2Y1 !== undefined)
            this.childX2Y1.forEach(visitor);
        if (this.childX1Y2 !== undefined)
            this.childX1Y2.forEach(visitor);
        if (this.childX2Y2 !== undefined)
            this.childX2Y2.forEach(visitor);
    }

    forEachInBox(box: ReadonlyBox2, visitor: (element: E) => any) {
        this.solids.forEach(e => {
            if (e.intersects(box))
                visitor(e.element);
        });
        this.points.forEach(e => {
            if (e.intersects(box))
                visitor(e.element);
        });
        const child = this.findChildForBoundingBox(box);
        if (child !== this)
            child.forEachInBox(box, visitor);
        else {
            if (this.childX1Y1 !== undefined)
                this.childX1Y1.forEachInBox(box, visitor);
            if (this.childX2Y1 !== undefined)
                this.childX2Y1.forEachInBox(box, visitor);
            if (this.childX1Y2 !== undefined)
                this.childX1Y2.forEachInBox(box, visitor);
            if (this.childX2Y2 !== undefined)
                this.childX2Y2.forEachInBox(box, visitor);
        }
    }

    forEachNode(visitor: (node: QuadTreeNode<E>) => any) {
        visitor(this);
        if (this.childX1Y1 !== undefined)
            this.childX1Y1.forEachNode(visitor);
        if (this.childX2Y1 !== undefined)
            this.childX2Y1.forEachNode(visitor);
        if (this.childX1Y2 !== undefined)
            this.childX1Y2.forEachNode(visitor);
        if (this.childX2Y2 !== undefined)
            this.childX2Y2.forEachNode(visitor);
    }

    rebuild(x1: number, y1: number, x2: number, y2: number) {
        this.position.set((x1 + x2) * .5, (y1 + y2) * .5);
        if (this.childX1Y1 !== undefined)
            this.childX1Y1.rebuild(x1, y1, this.position.x, this.position.y);
        if (this.childX2Y1 !== undefined)
            this.childX2Y1.rebuild(this.position.x, y1, x2, this.position.y);
        if (this.childX1Y2 !== undefined)
            this.childX1Y2.rebuild(x1, this.position.y, this.position.x, y2);
        if (this.childX2Y2 !== undefined)
            this.childX2Y2.rebuild(this.position.x, this.position.y, x2, y2);
    }
}

export class QuadTree<E> {

    private _boundingBox = Box2.empty();
    private _root: QuadTreeNode<E>;
    private _size: number = 0;

    get boundingBox(): ReadonlyBox2 {
        return this._boundingBox;
    }

    get size(): number {
        return this._size;
    }

    constructor(depth: number) {
        this._root = new QuadTreeNode(depth);
    }

    addPoint(element: E, position: ReadonlyVector2) {
        this.findRecursivelyForPoint(position).points.push(new QuadTreePointItem(element, position.clone()));
        ++this._size;
    }

    addSolid(element: E, box: ReadonlyBox2) {
        this.findRecursivelyForBoundingBox(box).solids.push(new QuadTreeSolidItem(element, box.clone()));
        ++this._size;
    }

    clear() {
        this._root.clear();
    }

    forEach(visitor: (element: E) => any) {
        this._root.forEach(visitor);
    }

    forEachInBox(box: ReadonlyBox2, visitor: (element: E) => any) {
        this._root.forEachInBox(box, visitor);
    }

    movePoint(element: E, start: ReadonlyVector2, end: ReadonlyVector2) {
        const node = this.findRecursivelyForPoint(start);
        const i = node.points.findIndex(e => e.element === element);
        if (i >= 0) {
            const obj = node.points.splice(i, 1)[0];
            obj.position.setVector(end);
            this.findRecursivelyForPoint(end).points.push(obj);
        }
    }

    moveSolid(element: E, start: ReadonlyBox2, end: ReadonlyBox2) {
        const node = this.findRecursivelyForBoundingBox(start);
        const i = node.solids.findIndex(e => e.element === element);
        if (i >= 0) {
            const obj = node.solids.splice(i, 1)[0];
            obj.boundingBox.setBoundingBox(end);
            this.findRecursivelyForBoundingBox(end).solids.push(obj);
        }
    }

    rebuild(minBox?: ReadonlyBox2) {
        this._boundingBox.clear();
        if (minBox !== undefined)
            this._boundingBox.extendByBox(minBox);
        const elements: Array<QuadTreeItem<E>> = [];
        this.forEachNode(node => {
            node.solids.forEach(el => {
                el.extendBoundingBox(this._boundingBox);
                elements.push(el);
            });
            node.points.forEach(el => {
                el.extendBoundingBox(this._boundingBox);
                elements.push(el);
            });
            node.solids = [];
            node.points = [];
        });
        const min = this._boundingBox.minimum;
        const max = this._boundingBox.maximum;
        if (min != undefined && max != undefined) {
            this._root.rebuild(min.x, min.y, max.x, max.y);
        }
        elements.forEach(i => i.insert(this._root));
    }

    removePoint(element: E, position: ReadonlyVector2): boolean {
        const points = this.findRecursivelyForPoint(position).points;
        const i = points.findIndex(el => el.element === element);
        if (i >= 0) {
            points.splice(i, 1);
            --this._size;
            return true;
        } else {
            return false;
        }
    }

    removeSolid(element: E, box: ReadonlyBox2): boolean {
        const solids = this.findRecursivelyForBoundingBox(box).solids;
        const i = solids.findIndex(el => el.element === element);
        if (i >= 0) {
            solids.splice(i, 1);
            --this._size;
            return true;
        } else {
            return false;
        }
    }

    private findRecursivelyForBoundingBox(box: ReadonlyBox2): QuadTreeNode<E> {
        return this._root.findRecursivelyForBoundingBox(box);
    }

    private findRecursivelyForPoint(position: ReadonlyVector2): QuadTreeNode<E> {
        return this._root.findRecursivelyForPoint(position);
    }

    private forEachNode(visitor: (node: QuadTreeNode<E>) => any) {
        this._root.forEachNode(visitor);
    }
}