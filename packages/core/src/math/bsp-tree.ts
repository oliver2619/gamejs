import { Plane } from "./plane";
import { Polygon3d } from "./polygon-3d";
import { ReadonlyVector3d, Vector3d } from "./vector-3d";

export interface BspTreeNodeVisitor<P, O> {
    visitPolygon(polygon: P): void;
    visitObject(obj: O): void;
}

export interface BspTreeNode<P, O> {
    add(obj: O, position: ReadonlyVector3d): BspTreeNode<P, O>;
    filterObjects(filter: (obj: O) => boolean): void;
    findNode(position: ReadonlyVector3d): BspTreeNodeLeaf<P, O>;
    forEachBackToFront(position: ReadonlyVector3d, lookDirection: ReadonlyVector3d, visitor: BspTreeNodeVisitor<P, O>): void;
    forEachObject(callback: (obj: O) => any): void;
    forEachPolygon(position: ReadonlyVector3d, callback: (polygon: P) => any): void;
    isLeaf(): boolean;
}

class BspTreeNodePlane<P, O> implements BspTreeNode<P, O> {

    private back: BspTreeNode<P, O>;
    private front: BspTreeNode<P, O>;

    constructor(back: BspTreeNode<P, O>, front: BspTreeNode<P, O>, private backPolygon: P, private frontPolygon: P, private plane: Plane) {
        this.back = back;
        this.front = front;
    }

    add(obj: O, position: ReadonlyVector3d): BspTreeNode<P, O> {
        if (this.plane.getSignedDistance(position) < 0)
            return this.back.add(obj, position);
        else
            return this.front.add(obj, position);
    }

    filterObjects(filter: (obj: O) => boolean): void {
        this.back.filterObjects(filter);
        this.front.filterObjects(filter);
    }

    findNode(position: ReadonlyVector3d): BspTreeNodeLeaf<P, O> {
        if (this.plane.getSignedDistance(position) < 0)
            return this.back.findNode(position);
        else
            return this.front.findNode(position);
    }

    forEachBackToFront(position: ReadonlyVector3d, lookDirection: ReadonlyVector3d, visitor: BspTreeNodeVisitor<P, O>): void {
        if (this.plane.getSignedDistance(position) < 0) {
            this.front.forEachBackToFront(position, lookDirection, visitor);
            visitor.visitPolygon(this.backPolygon);
            this.back.forEachBackToFront(position, lookDirection, visitor);
        } else {
            this.back.forEachBackToFront(position, lookDirection, visitor);
            visitor.visitPolygon(this.frontPolygon);
            this.front.forEachBackToFront(position, lookDirection, visitor);
        }
    }

    forEachObject(callback: (obj: O) => any): void {
        this.back.forEachObject(callback);
        this.front.forEachObject(callback);
    }

    forEachPolygon(position: ReadonlyVector3d, callback: (polygon: P) => any): void {
        if (this.plane.getSignedDistance(position) < 0) {
            this.front.forEachPolygon(position, callback);
            callback(this.backPolygon);
            this.back.forEachPolygon(position, callback);
        } else {
            this.back.forEachPolygon(position, callback);
            callback(this.frontPolygon);
            this.front.forEachPolygon(position, callback);
        }
    }

    isLeaf(): boolean { return false; }
}

export class BspTreeObject<O> {

    sortCache: number = 0;

    constructor(public obj: O, public position: Vector3d) { }
}

export class BspTreeNodeLeaf<P, O> implements BspTreeNode<P, O> {

    private objects: Array<BspTreeObject<O>> = [];
    private lastSortVector: ReadonlyVector3d | undefined;

    add(obj: O, position: ReadonlyVector3d): BspTreeNode<P, O> {
        this.addObject(new BspTreeObject(obj, position.clone()));
        return this;
    }

    addObject(obj: BspTreeObject<O>): void {
        this.objects.push(obj);
        this.lastSortVector = undefined;
    }

    filterObjects(filter: (obj: O) => boolean): void {
        this.objects = this.objects.filter(o => filter(o.obj));
    }

    findNode(_: Vector3d): BspTreeNodeLeaf<P, O> {
        return this;
    }

    forEachBackToFront(_: ReadonlyVector3d, lookDirection: ReadonlyVector3d, visitor: BspTreeNodeVisitor<P, O>): void {
        this.sortBackToFront(lookDirection);
        this.objects.forEach(o => visitor.visitObject(o.obj));
    }

    forEachObject(callback: (obj: O) => any): void {
        this.objects.forEach(o => callback(o.obj));
    }

    forEachPolygon(_: ReadonlyVector3d, __: (polygon: P) => any): void { }

    isLeaf(): boolean { return true; }

    move(obj: O, newPos: ReadonlyVector3d): void {
        const treeObj = this.objects.find(el => el.obj === obj);
        if (treeObj !== undefined) {
            treeObj.position.setVector(newPos);
        }
    }

    findAndRemoveObject(obj: O): BspTreeObject<O> | undefined {
        const i = this.objects.findIndex(e => e.obj === obj);
        if (i >= 0) {
            return this.objects.splice(i, 1)[0];
        } else {
            return undefined;
        }
    }

    private sortBackToFront(cameraLookDirection: ReadonlyVector3d): void {
        if (this.lastSortVector === undefined || !this.lastSortVector.equals(cameraLookDirection)) {
            this.objects.forEach(o => o.sortCache = o.position.getDotProduct(cameraLookDirection));
            this.objects.sort((o1, o2) => o2.sortCache - o1.sortCache);
            this.lastSortVector = cameraLookDirection;
        }
    }
}

export class BspTree<P, O> {

    private _root: BspTreeNode<P, O>;

    constructor(root: BspTreeNode<P, O>) {
        this._root = root;
    }

    add(obj: O, position: ReadonlyVector3d): BspTreeNode<P, O> {
        return this._root.add(obj, position);
    }

    filterObjects(filter: (obj: O) => boolean): void {
        this._root.filterObjects(filter);
    }

    forEachBackToFront(position: ReadonlyVector3d, lookDirection: ReadonlyVector3d, visitor: BspTreeNodeVisitor<P, O>): void {
        this._root.forEachBackToFront(position, lookDirection, visitor);
    }

    forEachObject(callback: (obj: O) => any): void {
        this._root.forEachObject(callback);
    }

    forEachPolygon(position: ReadonlyVector3d, callback: (p: P) => any): void {
        this._root.forEachPolygon(position, callback);
    }

    move(obj: O, startNode: BspTreeNode<P, O>, endPosition: ReadonlyVector3d): BspTreeNode<P, O> {
        const endNode = this._root.findNode(endPosition);
        if (startNode !== endNode) {
            const el = (startNode as BspTreeNodeLeaf<P, O>).findAndRemoveObject(obj);
            if (el != undefined) {
                el.position.setVector(endPosition);
                endNode.addObject(el);
            }
            return endNode;
        } else {
            (startNode as BspTreeNodeLeaf<P, O>).move(obj, endPosition);
            return startNode;
        }
    }

    remove(obj: O, node: BspTreeNode<P, O>): void {
        (node as BspTreeNodeLeaf<P, O>).findAndRemoveObject(obj);
    }
}

class BspTreePolygon<D> {

    constructor(public polygon: Polygon3d, public data: D) { }
}

export class BspTreeBuilder<D> {

    private polygons: Array<BspTreePolygon<D>> = [];

    addPolygon(polygon: Polygon3d, data: D): BspTreeBuilder<D> {
        this.polygons.push(new BspTreePolygon(polygon, data));
        return this;
    }

    build<P, O>(conversion: (polygon: Polygon3d, data: D) => P): BspTree<P, O> {
        return new BspTree(this.convert(this.polygons, conversion));
    }

    private convert<P, O>(polygons: Array<BspTreePolygon<D>>, conversion: (polygon: Polygon3d, data: D) => P): BspTreeNode<P, O> {
        const found = this.findNextPolygon(polygons);
        if (found === undefined)
            return new BspTreeNodeLeaf();
        const backPolygons: Array<BspTreePolygon<D>> = [];
        const frontPolygons: Array<BspTreePolygon<D>> = [];
        polygons.forEach(p => {
            if (p !== found) {
                let splitResult = p.polygon.splitBy(found.polygon.plane);
                if (splitResult.back !== undefined)
                    backPolygons.push(new BspTreePolygon(splitResult.back, p.data));
                if (splitResult.front !== undefined)
                    frontPolygons.push(new BspTreePolygon(splitResult.front, p.data));
            }
        });
        const frontPolygon = conversion(found.polygon, found.data);
        const backPolygon = conversion(found.polygon.reverse(), found.data);
        return new BspTreeNodePlane(this.convert(backPolygons, conversion), this.convert(frontPolygons, conversion), backPolygon, frontPolygon, found.polygon.plane);
    }

    private findNextPolygon(polygons: Array<BspTreePolygon<D>>): BspTreePolygon<D> | undefined {
        let ret: BspTreePolygon<D> | undefined;
        let minSplitCount: number, splitCount: number;
        polygons.forEach(n1 => {
            splitCount = 0;
            polygons.forEach(n2 => {
                if (n2 !== n1 && n2.polygon.isSplitBy(n1.polygon.plane))
                    ++splitCount;
            });
            if (minSplitCount === undefined || splitCount < minSplitCount) {
                minSplitCount = splitCount;
                ret = n1;
            }
        });
        return ret;
    }
}
