import { Box3, ReadonlyBox3 } from "./box3";
import { ReadonlyVector3, Vector3 } from "./vector3";

abstract class OctTreeItem<E> {

    constructor(public element: E) { }

    abstract extendBoundingBox(box: Box3): void;

    abstract insert(node: OctTreeNode<E>): void;

    abstract intersects(box: ReadonlyBox3): boolean;
}

class OctTreeSolidItem<E> extends OctTreeItem<E> {

    constructor(element: E, public readonly boundingBox: Box3) {
        super(element);
    }

    extendBoundingBox(box: Box3) {
        box.extendByBox(this.boundingBox);
    }

    insert(node: OctTreeNode<E>) {
        node.findRecursivelyForBoundingBox(this.boundingBox).solids.push(this);
    }

    intersects(box: ReadonlyBox3): boolean {
        return box.intersectsBox(this.boundingBox);
    }
}

class OctTreePointItem<E> extends OctTreeItem<E> {

    constructor(element: E, public position: Vector3) {
        super(element);
    }

    extendBoundingBox(box: Box3) {
        box.extendByPoint(this.position);
    }

    insert(node: OctTreeNode<E>) {
        node.findRecursivelyForPoint(this.position).points.push(this);
    }

    intersects(box: ReadonlyBox3): boolean {
        return box.intersectsPoint(this.position);
    }
}

class OctTreeNode<E> {
    position: Vector3 = new Vector3(0, 0, 0);
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

    findChildForBoundingBox(box: ReadonlyBox3): OctTreeNode<E> {
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

    findRecursivelyForBoundingBox(box: ReadonlyBox3): OctTreeNode<E> {
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

    findRecursivelyForPoint(position: ReadonlyVector3): OctTreeNode<E> {
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

    forEachInBox(box: ReadonlyBox3, visitor: (element: E) => any) {
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

    private _boundingBox = Box3.empty();
    private _root: OctTreeNode<E>;
    private _size: number = 0;

    get boundingBox(): ReadonlyBox3 {
        return this._boundingBox;
    }

    get size(): number {
        return this._size;
    }

    constructor(depth: number) {
        this._root = new OctTreeNode(depth);
    }

    addPoint(element: E, position: ReadonlyVector3) {
        this.findRecursivelyForPoint(position).points.push(new OctTreePointItem(element, position.clone()));
        ++this._size;
    }

    addSolid(element: E, box: ReadonlyBox3) {
        this.findRecursivelyForBoundingBox(box).solids.push(new OctTreeSolidItem(element, box.clone()));
        ++this._size;
    }

    clear() {
        this._root.clear();
    }

    forEach(visitor: (element: E) => any) {
        this._root.forEach(visitor);
    }

    forEachInBox(box: ReadonlyBox3, visitor: (element: E) => any) {
        this._root.forEachInBox(box, visitor);
    }

    movePoint(element: E, start: ReadonlyVector3, end: ReadonlyVector3) {
        const node = this.findRecursivelyForPoint(start);
        const i = node.points.findIndex(e => e.element === element);
        if (i >= 0) {
            const obj = node.points.splice(i, 1)[0];
            obj.position.setVector(end);
            this.findRecursivelyForPoint(end).points.push(obj);
        }
    }

    moveSolid(element: E, start: ReadonlyBox3, end: ReadonlyBox3) {
        let node = this.findRecursivelyForBoundingBox(start);
        let i = node.solids.findIndex(e => e.element === element);
        if (i >= 0) {
            let obj = node.solids.splice(i, 1)[0];
            obj.boundingBox.setBoundingBox(end);
            this.findRecursivelyForBoundingBox(end).solids.push(obj);
        }
    }

    rebuild(minBox?: ReadonlyBox3) {
        this._boundingBox.clear();
        if (minBox !== undefined)
            this._boundingBox.extendByBox(minBox);
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
            node.solids = [];
            node.points = [];
        });
        const min = this._boundingBox.minimum;
        const max = this._boundingBox.maximum;
        if (min != undefined && max != undefined) {
            this._root.rebuild(min.x, min.y, min.z, max.x, max.y, max.z);
        }
        elements.forEach(i => i.insert(this._root));
    }

    removeAtBox(predicate: (e: E) => boolean, box: ReadonlyBox3): E | undefined {
        const solids = this.findRecursivelyForBoundingBox(box).solids;
        const i = solids.findIndex(el => predicate(el.element));
        if (i >= 0) {
            const ret = solids[i].element;
            solids.splice(i, 1);
            --this._size;
            return ret;
        } else {
            return undefined;
        }
    }

    removePoint(element: E, position: ReadonlyVector3): boolean {
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

    removeSolid(element: E, box: ReadonlyBox3): boolean {
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

    private findRecursivelyForBoundingBox(box: ReadonlyBox3): OctTreeNode<E> {
        return this._root.findRecursivelyForBoundingBox(box);
    }

    private findRecursivelyForPoint(position: ReadonlyVector3): OctTreeNode<E> {
        return this._root.findRecursivelyForPoint(position);
    }

    private forEachNode(visitor: (node: OctTreeNode<E>) => any) {
        this._root.forEachNode(visitor);
    }
}