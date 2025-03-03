import { Box2d, ReadonlyBox2d } from "./box-2d";
import { ReadonlyVector2d, Vector2d } from "./vector-2d";

abstract class QuadTreeItem<E> {

    unprocessed = false;

    constructor(public element: E) { }

    abstract extendBoundingBox(box: Box2d): void;

    abstract insert(node: QuadTreeNode<E>): void;

    abstract intersects(box: ReadonlyBox2d): boolean;
}

class QuadTreeSolidItem<E> extends QuadTreeItem<E> {

    constructor(element: E, public readonly boundingBox: Box2d) {
        super(element);
    }

    extendBoundingBox(box: Box2d) {
        box.extendByBox(this.boundingBox);
    }

    insert(node: QuadTreeNode<E>) {
        node.findRecursivelyForBoundingBox(this.boundingBox).solids.push(this);
    }

    intersects(box: ReadonlyBox2d): boolean {
        return box.intersectsBox(this.boundingBox);
    }
}

class QuadTreePointItem<E> extends QuadTreeItem<E> {

    constructor(element: E, public position: Vector2d) {
        super(element);
    }

    extendBoundingBox(box: Box2d) {
        box.extendByPoint(this.position);
    }

    insert(node: QuadTreeNode<E>) {
        node.findRecursivelyForPoint(this.position).points.push(this);
    }

    intersects(box: ReadonlyBox2d): boolean {
        return box.intersectsPoint(this.position);
    }
}

class QuadTreeNode<E> {
    position: Vector2d = new Vector2d(0, 0);
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

    findChildForBoundingBox(box: ReadonlyBox2d): QuadTreeNode<E> {
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

    findRecursivelyForBoundingBox(box: ReadonlyBox2d): QuadTreeNode<E> {
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

    findRecursivelyForPoint(position: ReadonlyVector2d): QuadTreeNode<E> {
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

    forEach(visitor: (element: E) => void) {
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

    forEachInBox(box: ReadonlyBox2d, visitor: (element: E) => void) {
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

    forEachNode(visitor: (node: QuadTreeNode<E>) => void) {
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

    forEachSolid(visitor: (s: QuadTreeSolidItem<E>) => void) {
        this.solids.forEach(visitor);
        if (this.childX1Y1 !== undefined)
            this.childX1Y1.forEachSolid(visitor);
        if (this.childX2Y1 !== undefined)
            this.childX2Y1.forEachSolid(visitor);
        if (this.childX1Y2 !== undefined)
            this.childX1Y2.forEachSolid(visitor);
        if (this.childX2Y2 !== undefined)
            this.childX2Y2.forEachSolid(visitor);
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

    private _boundingBox = Box2d.empty();
    private _root: QuadTreeNode<E>;
    private _size: number = 0;
    private _minDepth: number;

    get boundingBox(): ReadonlyBox2d {
        return this._boundingBox;
    }

    get minDepth(): number {
        return this._minDepth;
    }

    get size(): number {
        return this._size;
    }

    private constructor(minDepth: number) {
        this._minDepth = minDepth;
        this._root = new QuadTreeNode(minDepth);
    }

    static withMinimumNumberOfElements<E>(n: number): QuadTree<E> {
        return new QuadTree<E>(QuadTree.numberOfElementsToDepth(n));
    }

    // Number of slots = log4(n), depth = log4(slots)
    private static numberOfElementsToDepth(n: number): number {
        return Math.ceil(Math.log(Math.log(Math.max(4, n)) / Math.log(4)) / Math.log(4));
    }

    addPoint(element: E, position: ReadonlyVector2d) {
        this.findRecursivelyForPoint(position).points.push(new QuadTreePointItem(element, position.clone()));
        ++this._size;
    }

    addSolid(element: E, box: ReadonlyBox2d) {
        this.findRecursivelyForBoundingBox(box).solids.push(new QuadTreeSolidItem(element, box.clone()));
        ++this._size;
    }

    clear() {
        this._root.clear();
    }

    forEach(visitor: (element: E) => any) {
        this._root.forEach(visitor);
    }

    forEachInBox(box: ReadonlyBox2d, visitor: (element: E) => any) {
        this._root.forEachInBox(box, visitor);
    }

    moveAllSolidsIf(condition: (e: E) => boolean, callback: (e: E) => ReadonlyBox2d) {
        this.forEachNode(node => {
            node.solids.forEach(solid => solid.unprocessed = true);
        });
        this.forEachNode(node => {
            const solidCnt = node.solids.length;
            for (let i = 0; i < solidCnt; ++i) {
                const solid = node.solids[i]!;
                if (solid.unprocessed) {
                    solid.unprocessed = false;
                    if (condition(solid.element)) {
                        const newBoundingBox = callback(solid.element);
                        const newNode = this.findRecursivelyForBoundingBox(newBoundingBox);
                        if (newNode !== node) {
                            node.solids.splice(i, 1);
                            --i;
                            newNode.solids.push(solid);
                        }
                        solid.boundingBox.setBoundingBox(newBoundingBox);
                    }
                }
            }
        });
    }

    movePoint(element: E, start: ReadonlyVector2d, end: ReadonlyVector2d) {
        const node = this.findRecursivelyForPoint(start);
        const i = node.points.findIndex(e => e.element === element);
        if (i >= 0) {
            const obj = node.points.splice(i, 1)[0]!;
            obj.position.setVector(end);
            this.findRecursivelyForPoint(end).points.push(obj);
        }
    }

    moveSolid(element: E, start: ReadonlyBox2d, end: ReadonlyBox2d) {
        const node = this.findRecursivelyForBoundingBox(start);
        const i = node.solids.findIndex(e => e.element === element);
        if (i >= 0) {
            const obj = node.solids.splice(i, 1)[0]!;
            obj.boundingBox.setBoundingBox(end);
            this.findRecursivelyForBoundingBox(end).solids.push(obj);
        }
    }

    rebuild(data?: { minBox?: ReadonlyBox2d, minNumberOfElements?: number }) {
        this._boundingBox.clear();
        if (data != undefined && data.minBox != undefined) {
            this._boundingBox.extendByBox(data.minBox);
        }
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
        });
        const min = this._boundingBox.minimum;
        const max = this._boundingBox.maximum;
        const minElements = (data == undefined || data.minNumberOfElements == undefined || data.minNumberOfElements < elements.length) ? elements.length : data.minNumberOfElements;
        this._minDepth = QuadTree.numberOfElementsToDepth(minElements);
        this._root = new QuadTreeNode(this._minDepth);
        if (min != undefined && max != undefined) {
            this._root.rebuild(min.x, min.y, max.x, max.y);
        }
        elements.forEach(i => i.insert(this._root));
    }

    removeAtBox(predicate: (e: E) => boolean, box: ReadonlyBox2d): E | undefined {
        const solids = this.findRecursivelyForBoundingBox(box).solids;
        const i = solids.findIndex(el => predicate(el.element));
        if (i >= 0) {
            const ret = solids[i]!.element;
            solids.splice(i, 1);
            --this._size;
            return ret;
        } else {
            return undefined;
        }
    }

    removePoint(element: E, position: ReadonlyVector2d): boolean {
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

    removeSolid(element: E, box: ReadonlyBox2d): boolean {
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

    private findRecursivelyForBoundingBox(box: ReadonlyBox2d): QuadTreeNode<E> {
        return this._root.findRecursivelyForBoundingBox(box);
    }

    private findRecursivelyForPoint(position: ReadonlyVector2d): QuadTreeNode<E> {
        return this._root.findRecursivelyForPoint(position);
    }

    private forEachNode(visitor: (node: QuadTreeNode<E>) => any) {
        this._root.forEachNode(visitor);
    }
}