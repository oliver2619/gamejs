import { Box3d, ReadonlyBox3d } from "./box-3d";
import { ReadonlyVector3d, Vector3d } from "./vector-3d";

abstract class OctTreeItem<E> {

    unprocessed = false;

    constructor(public element: E) { }

    abstract extendBoundingBox(box: Box3d): void;

    abstract insert(node: OctTreeNode<E>): void;

    abstract intersects(box: ReadonlyBox3d): boolean;
}

class OctTreeSolidItem<E> extends OctTreeItem<E> {

    constructor(element: E, public readonly boundingBox: Box3d) {
        super(element);
    }

    extendBoundingBox(box: Box3d) {
        box.extendByBox(this.boundingBox);
    }

    insert(node: OctTreeNode<E>) {
        node.findRecursivelyForBoundingBox(this.boundingBox).solids.push(this);
    }

    intersects(box: ReadonlyBox3d): boolean {
        return box.intersectsBox(this.boundingBox);
    }
}

class OctTreePointItem<E> extends OctTreeItem<E> {

    constructor(element: E, public position: Vector3d) {
        super(element);
    }

    extendBoundingBox(box: Box3d) {
        box.extendByPoint(this.position);
    }

    insert(node: OctTreeNode<E>) {
        node.findRecursivelyForPoint(this.position).points.push(this);
    }

    intersects(box: ReadonlyBox3d): boolean {
        return box.intersectsPoint(this.position);
    }
}

class OctTreeNode<E> {
    position: Vector3d = new Vector3d(0, 0, 0);
    solids: Array<OctTreeSolidItem<E>> = [];
    points: Array<OctTreePointItem<E>> = [];
    childX1Y1Z1: OctTreeNode<E> | undefined;
    childX2Y1Z1: OctTreeNode<E> | undefined;
    childX1Y2Z1: OctTreeNode<E> | undefined;
    childX2Y2Z1: OctTreeNode<E> | undefined;
    childX1Y1Z2: OctTreeNode<E> | undefined;
    childX2Y1Z2: OctTreeNode<E> | undefined;
    childX1Y2Z2: OctTreeNode<E> | undefined;
    childX2Y2Z2: OctTreeNode<E> | undefined;

    constructor(depth: number) {
        if (depth > 0) {
            this.childX1Y1Z1 = new OctTreeNode(depth - 1);
            this.childX2Y1Z1 = new OctTreeNode(depth - 1);
            this.childX1Y2Z1 = new OctTreeNode(depth - 1);
            this.childX2Y2Z1 = new OctTreeNode(depth - 1);
            this.childX1Y1Z2 = new OctTreeNode(depth - 1);
            this.childX2Y1Z2 = new OctTreeNode(depth - 1);
            this.childX1Y2Z2 = new OctTreeNode(depth - 1);
            this.childX2Y2Z2 = new OctTreeNode(depth - 1);
        }
    }

    clear() {
        this.solids = [];
        this.points = [];
        if (this.childX1Y1Z1 !== undefined)
            this.childX1Y1Z1.clear();
        if (this.childX2Y1Z1 !== undefined)
            this.childX2Y1Z1.clear();
        if (this.childX1Y2Z1 !== undefined)
            this.childX1Y2Z1.clear();
        if (this.childX2Y2Z1 !== undefined)
            this.childX2Y2Z1.clear();
        if (this.childX1Y1Z2 !== undefined)
            this.childX1Y1Z2.clear();
        if (this.childX2Y1Z2 !== undefined)
            this.childX2Y1Z2.clear();
        if (this.childX1Y2Z2 !== undefined)
            this.childX1Y2Z2.clear();
        if (this.childX2Y2Z2 !== undefined)
            this.childX2Y2Z2.clear();
    }

    findChildForBoundingBox(box: ReadonlyBox3d): OctTreeNode<E> {
        const min = box.minimum;
        const max = box.maximum;
        if (min == undefined || max == undefined) {
            return this;
        }
        if (max.x < this.position.x) {
            if (max.y < this.position.y) {
                if (max.z < this.position.z && this.childX1Y1Z1 !== undefined)
                    return this.childX1Y1Z1;
                else if (min.z > this.position.z && this.childX1Y1Z2 !== undefined)
                    return this.childX1Y1Z2;
                else
                    return this;
            } else if (min.y > this.position.y) {
                if (max.z < this.position.z && this.childX1Y2Z1 !== undefined)
                    return this.childX1Y2Z1;
                else if (min.z > this.position.z && this.childX1Y2Z2 !== undefined)
                    return this.childX1Y2Z2;
                else
                    return this;
            } else
                return this;
        } else if (min.x > this.position.x) {
            if (max.y < this.position.y) {
                if (max.z < this.position.z && this.childX2Y1Z1 !== undefined)
                    return this.childX2Y1Z1;
                else if (min.z > this.position.z && this.childX2Y1Z2 !== undefined)
                    return this.childX2Y1Z2;
                else
                    return this;
            } else if (min.y > this.position.y) {
                if (max.z < this.position.z && this.childX2Y2Z1 !== undefined)
                    return this.childX2Y2Z1;
                else if (min.z > this.position.z && this.childX2Y2Z2 !== undefined)
                    return this.childX2Y2Z2;
                else
                    return this;
            } else
                return this;
        } else
            return this;
    }

    findRecursivelyForBoundingBox(box: ReadonlyBox3d): OctTreeNode<E> {
        const min = box.minimum;
        const max = box.maximum;
        if (min == undefined || max == undefined) {
            return this;
        }
        if (max.x < this.position.x) {
            if (max.y < this.position.y) {
                if (max.z < this.position.z && this.childX1Y1Z1 !== undefined)
                    return this.childX1Y1Z1.findRecursivelyForBoundingBox(box);
                else if (min.z > this.position.z && this.childX1Y1Z2 !== undefined)
                    return this.childX1Y1Z2.findRecursivelyForBoundingBox(box);
                else
                    return this;
            } else if (min.y > this.position.y) {
                if (max.z < this.position.z && this.childX1Y2Z1 !== undefined)
                    return this.childX1Y2Z1.findRecursivelyForBoundingBox(box);
                else if (min.z > this.position.z && this.childX1Y2Z2 !== undefined)
                    return this.childX1Y2Z2.findRecursivelyForBoundingBox(box);
                else
                    return this;
            } else
                return this;
        } else if (min.x > this.position.x) {
            if (max.y < this.position.y) {
                if (max.z < this.position.z && this.childX2Y1Z1 !== undefined)
                    return this.childX2Y1Z1.findRecursivelyForBoundingBox(box);
                else if (min.z > this.position.z && this.childX2Y1Z2 !== undefined)
                    return this.childX2Y1Z2.findRecursivelyForBoundingBox(box);
                else
                    return this;
            } else if (min.y > this.position.y) {
                if (max.z < this.position.z && this.childX2Y2Z1 !== undefined)
                    return this.childX2Y2Z1.findRecursivelyForBoundingBox(box);
                else if (min.z > this.position.z && this.childX2Y2Z2 !== undefined)
                    return this.childX2Y2Z2.findRecursivelyForBoundingBox(box);
                else
                    return this;
            } else
                return this;
        } else
            return this;
    }

    findRecursivelyForPoint(position: ReadonlyVector3d): OctTreeNode<E> {
        if (position.x < this.position.x) {
            if (position.y < this.position.y) {
                if (position.z < this.position.z && this.childX1Y1Z1 !== undefined)
                    return this.childX1Y1Z1.findRecursivelyForPoint(position);
                else if (position.z > this.position.z && this.childX1Y1Z2 !== undefined)
                    return this.childX1Y1Z2.findRecursivelyForPoint(position);
                else
                    return this;
            } else if (position.y > this.position.y) {
                if (position.z < this.position.z && this.childX1Y2Z1 !== undefined)
                    return this.childX1Y2Z1.findRecursivelyForPoint(position);
                else if (position.z > this.position.z && this.childX1Y2Z2 !== undefined)
                    return this.childX1Y2Z2.findRecursivelyForPoint(position);
                else
                    return this;
            } else
                return this;
        } else if (position.x > this.position.x) {
            if (position.y < this.position.y) {
                if (position.z < this.position.z && this.childX2Y1Z1 !== undefined)
                    return this.childX2Y1Z1.findRecursivelyForPoint(position);
                else if (position.z > this.position.z && this.childX2Y1Z2 !== undefined)
                    return this.childX2Y1Z2.findRecursivelyForPoint(position);
                else
                    return this;
            } else if (position.y > this.position.y) {
                if (position.z < this.position.z && this.childX2Y2Z1 !== undefined)
                    return this.childX2Y2Z1.findRecursivelyForPoint(position);
                else if (position.z > this.position.z && this.childX2Y2Z2 !== undefined)
                    return this.childX2Y2Z2.findRecursivelyForPoint(position);
                else
                    return this;
            } else
                return this;
        } else
            return this;
    }

    forEach(visitor: (element: E) => any) {
        this.solids.forEach(e => visitor(e.element));
        this.points.forEach(e => visitor(e.element));
        if (this.childX1Y1Z1 !== undefined)
            this.childX1Y1Z1.forEach(visitor);
        if (this.childX2Y1Z1 !== undefined)
            this.childX2Y1Z1.forEach(visitor);
        if (this.childX1Y2Z1 !== undefined)
            this.childX1Y2Z1.forEach(visitor);
        if (this.childX2Y2Z1 !== undefined)
            this.childX2Y2Z1.forEach(visitor);
        if (this.childX1Y1Z2 !== undefined)
            this.childX1Y1Z2.forEach(visitor);
        if (this.childX2Y1Z2 !== undefined)
            this.childX2Y1Z2.forEach(visitor);
        if (this.childX1Y2Z2 !== undefined)
            this.childX1Y2Z2.forEach(visitor);
        if (this.childX2Y2Z2 !== undefined)
            this.childX2Y2Z2.forEach(visitor);
    }

    forEachInBox(box: ReadonlyBox3d, visitor: (element: E) => any) {
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
            if (this.childX1Y1Z1 !== undefined)
                this.childX1Y1Z1.forEachInBox(box, visitor);
            if (this.childX2Y1Z1 !== undefined)
                this.childX2Y1Z1.forEachInBox(box, visitor);
            if (this.childX1Y2Z1 !== undefined)
                this.childX1Y2Z1.forEachInBox(box, visitor);
            if (this.childX2Y2Z1 !== undefined)
                this.childX2Y2Z1.forEachInBox(box, visitor);
            if (this.childX1Y1Z2 !== undefined)
                this.childX1Y1Z2.forEachInBox(box, visitor);
            if (this.childX2Y1Z2 !== undefined)
                this.childX2Y1Z2.forEachInBox(box, visitor);
            if (this.childX1Y2Z2 !== undefined)
                this.childX1Y2Z2.forEachInBox(box, visitor);
            if (this.childX2Y2Z2 !== undefined)
                this.childX2Y2Z2.forEachInBox(box, visitor);
        }
    }

    forEachNode(visitor: (node: OctTreeNode<E>) => any) {
        visitor(this);
        if (this.childX1Y1Z1 !== undefined)
            this.childX1Y1Z1.forEachNode(visitor);
        if (this.childX2Y1Z1 !== undefined)
            this.childX2Y1Z1.forEachNode(visitor);
        if (this.childX1Y2Z1 !== undefined)
            this.childX1Y2Z1.forEachNode(visitor);
        if (this.childX2Y2Z1 !== undefined)
            this.childX2Y2Z1.forEachNode(visitor);
        if (this.childX1Y1Z2 !== undefined)
            this.childX1Y1Z2.forEachNode(visitor);
        if (this.childX2Y1Z2 !== undefined)
            this.childX2Y1Z2.forEachNode(visitor);
        if (this.childX1Y2Z2 !== undefined)
            this.childX1Y2Z2.forEachNode(visitor);
        if (this.childX2Y2Z2 !== undefined)
            this.childX2Y2Z2.forEachNode(visitor);
    }

    rebuild(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) {
        this.position.set((x1 + x2) * .5, (y1 + y2) * .5, (z1 + z2) * .5);
        if (this.childX1Y1Z1 !== undefined)
            this.childX1Y1Z1.rebuild(x1, y1, z1, this.position.x, this.position.y, this.position.z);
        if (this.childX2Y1Z1 !== undefined)
            this.childX2Y1Z1.rebuild(this.position.x, y1, z1, x2, this.position.y, this.position.z);
        if (this.childX1Y2Z1 !== undefined)
            this.childX1Y2Z1.rebuild(x1, this.position.y, z1, this.position.x, y2, this.position.z);
        if (this.childX2Y2Z1 !== undefined)
            this.childX2Y2Z1.rebuild(this.position.x, this.position.y, z1, x2, y2, this.position.z);
        if (this.childX1Y1Z2 !== undefined)
            this.childX1Y1Z2.rebuild(x1, y1, this.position.z, this.position.x, this.position.y, z2);
        if (this.childX2Y1Z2 !== undefined)
            this.childX2Y1Z2.rebuild(this.position.x, y1, this.position.z, x2, this.position.y, z2);
        if (this.childX1Y2Z2 !== undefined)
            this.childX1Y2Z2.rebuild(x1, this.position.y, this.position.z, this.position.x, y2, z2);
        if (this.childX2Y2Z2 !== undefined)
            this.childX2Y2Z2.rebuild(this.position.x, this.position.y, this.position.z, x2, y2, z2);
    }
}

export class OctTree<E> {

    private _boundingBox = Box3d.empty();
    private _root: OctTreeNode<E>;
    private _size: number = 0;
    private _minDepth: number;

    get boundingBox(): ReadonlyBox3d {
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
        this._root = new OctTreeNode(minDepth);
    }

    static withMinimumNumberOfElements<E>(n: number): OctTree<E> {
        return new OctTree<E>(OctTree.numberOfElementsToDepth(n));
    }

    // Number of slots = log8(n), depth = log8(slots)
    private static numberOfElementsToDepth(n: number): number {
        return Math.ceil(Math.log(Math.log(Math.max(8, n)) / Math.log(8)) / Math.log(8));
    }

    addPoint(element: E, position: ReadonlyVector3d) {
        this.findRecursivelyForPoint(position).points.push(new OctTreePointItem(element, position.clone()));
        ++this._size;
    }

    addSolid(element: E, box: ReadonlyBox3d) {
        this.findRecursivelyForBoundingBox(box).solids.push(new OctTreeSolidItem(element, box.clone()));
        ++this._size;
    }

    clear() {
        this._root.clear();
    }

    forEach(visitor: (element: E) => any) {
        this._root.forEach(visitor);
    }

    forEachInBox(box: ReadonlyBox3d, visitor: (element: E) => any) {
        this._root.forEachInBox(box, visitor);
    }

    moveAllSolidsIf(condition: (e: E) => boolean, callback: (e: E) => ReadonlyBox3d) {
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

    movePoint(element: E, start: ReadonlyVector3d, end: ReadonlyVector3d) {
        const node = this.findRecursivelyForPoint(start);
        const i = node.points.findIndex(e => e.element === element);
        if (i >= 0) {
            const obj = node.points.splice(i, 1)[0]!;
            obj.position.setVector(end);
            this.findRecursivelyForPoint(end).points.push(obj);
        }
    }

    moveSolid(element: E, start: ReadonlyBox3d, end: ReadonlyBox3d) {
        let node = this.findRecursivelyForBoundingBox(start);
        let i = node.solids.findIndex(e => e.element === element);
        if (i >= 0) {
            let obj = node.solids.splice(i, 1)[0]!;
            obj.boundingBox.setBoundingBox(end);
            this.findRecursivelyForBoundingBox(end).solids.push(obj);
        }
    }

    rebuild(data?: { minBox?: ReadonlyBox3d | undefined, minNumberOfElements?: number | undefined }) {
        this._boundingBox.clear();
        if (data != undefined && data.minBox != undefined) {
            this._boundingBox.extendByBox(data.minBox);
        }
        const elements: Array<OctTreeItem<E>> = [];
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
        this._minDepth = OctTree.numberOfElementsToDepth(minElements);
        this._root = new OctTreeNode(this._minDepth);
        if (min != undefined && max != undefined) {
            this._root.rebuild(min.x, min.y, min.z, max.x, max.y, max.z);
        }
        elements.forEach(i => i.insert(this._root));
    }

    removeAtBox(predicate: (e: E) => boolean, box: ReadonlyBox3d): E | undefined {
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

    removePoint(element: E, position: ReadonlyVector3d): boolean {
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

    removeSolid(element: E, box: ReadonlyBox3d): boolean {
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

    private findRecursivelyForBoundingBox(box: ReadonlyBox3d): OctTreeNode<E> {
        return this._root.findRecursivelyForBoundingBox(box);
    }

    private findRecursivelyForPoint(position: ReadonlyVector3d): OctTreeNode<E> {
        return this._root.findRecursivelyForPoint(position);
    }

    private forEachNode(visitor: (node: OctTreeNode<E>) => any) {
        this._root.forEachNode(visitor);
    }
}