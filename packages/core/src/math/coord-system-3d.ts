import { ReadonlyVector3d, Vector3d } from "./vector-3d";

export interface CoordSystem3dData {
	position?: ReadonlyVector3d;
	axis?: { x: ReadonlyVector3d; y: ReadonlyVector3d, z: ReadonlyVector3d };
}

export interface ReadonlyCoordSystem3d {
	readonly position: Vector3d;
	readonly xAxis: Vector3d;
	readonly yAxis: Vector3d;
	readonly zAxis: Vector3d;
	readonly lookDirection: Vector3d;
	clone(): CoordSystem3d;
	getRotated(angle: ReadonlyVector3d): CoordSystem3d;
	getScaled(f: number): CoordSystem3d;
	globalToLocal(point: ReadonlyVector3d): Vector3d;
	globalDirectionToLocal(point: ReadonlyVector3d): Vector3d;
	localToGlobal(point: ReadonlyVector3d): Vector3d;
	localDirectionToGlobal(point: ReadonlyVector3d): Vector3d;
}

export class CoordSystem3d implements ReadonlyCoordSystem3d {

	position: Vector3d;
	xAxis: Vector3d;
	yAxis: Vector3d;
	zAxis: Vector3d;

	get lookDirection(): Vector3d {
		return this.zAxis.getScaled(-1);
	}

	constructor(data: CoordSystem3dData) {
		this.position = data?.position?.clone() ?? new Vector3d(0, 0, 0);
		if (data.axis !== undefined) {
			this.xAxis = data.axis.x.clone();
			this.yAxis = data.axis.y.clone();
			this.zAxis = data.axis.z.clone();
		} else {
			this.xAxis = new Vector3d(1, 0, 0);
			this.yAxis = new Vector3d(0, 1, 0);
			this.zAxis = new Vector3d(0, 0, 1);
		}
	}


	clone(): CoordSystem3d {
		return new CoordSystem3d({
			position: this.position,
			axis: { x: this.xAxis, y: this.yAxis, z: this.zAxis }
		});
	}

	getRotated(angle: ReadonlyVector3d): CoordSystem3d {
		return new CoordSystem3d({
			position: this.position,
			axis: { x: this.xAxis.getRotated(angle), y: this.yAxis.getRotated(angle), z: this.zAxis.getRotated(angle) }
		});
	}

	getScaled(f: number): CoordSystem3d {
		return new CoordSystem3d({
			position: this.position,
			axis: { x: this.xAxis.getScaled(f), y: this.yAxis.getScaled(f), z: this.zAxis.getScaled(f) }
		});
	}

	globalToLocal(point: ReadonlyVector3d): Vector3d {
		let diff = point.getDifference(this.position);
		return new Vector3d(
			diff.getDotProduct(this.xAxis) / this.xAxis.squareLength,
			diff.getDotProduct(this.yAxis) / this.yAxis.squareLength,
			diff.getDotProduct(this.zAxis) / this.zAxis.squareLength);
	}

	globalDirectionToLocal(point: ReadonlyVector3d): Vector3d {
		return new Vector3d(
			point.getDotProduct(this.xAxis) / this.xAxis.squareLength,
			point.getDotProduct(this.yAxis) / this.yAxis.squareLength,
			point.getDotProduct(this.zAxis) / this.zAxis.squareLength);
	}

	localToGlobal(point: ReadonlyVector3d): Vector3d {
		let ret = this.position.clone();
		ret.add(this.xAxis.getScaled(point.x));
		ret.add(this.yAxis.getScaled(point.y));
		ret.add(this.zAxis.getScaled(point.z));
		return ret;
	}

	localDirectionToGlobal(point: ReadonlyVector3d): Vector3d {
		let ret = this.xAxis.getScaled(point.x);
		ret.add(this.yAxis.getScaled(point.y));
		ret.add(this.zAxis.getScaled(point.z));
		return ret;
	}



	lookAt(target: ReadonlyVector3d, up: ReadonlyVector3d): void {
		this.setLookDirection(target.getDifference(this.position), up);
	}

	resetRotation(): void {
		this.xAxis.set(1, 0, 0);
		this.yAxis.set(0, 1, 0);
		this.zAxis.set(0, 0, 1);
	}

	rotate(axis: ReadonlyVector3d): void {
		this.xAxis.rotate(axis);
		this.yAxis.rotate(axis);
		this.zAxis.rotate(axis);
	}

	scale(f: number) {
		this.xAxis.scale(f);
		this.yAxis.scale(f);
		this.zAxis.scale(f);
	}

	setLookDirection(direction: ReadonlyVector3d, up: ReadonlyVector3d): void {
		this.zAxis.setVector(direction);
		this.zAxis.length = -1;
		this.xAxis.setVector(up.getNormalizedCrossProduct(this.zAxis));
		this.yAxis.setVector(this.zAxis.getCrossProduct(this.xAxis));
	}

	setXY(x: ReadonlyVector3d, y: ReadonlyVector3d): void {
		this.xAxis.setVector(x);
		this.xAxis.normalize();
		this.zAxis.setVector(x.getNormalizedCrossProduct(y));
		this.yAxis.setVector(this.zAxis.getCrossProduct(this.xAxis));
	}

	setXZ(x: ReadonlyVector3d, z: ReadonlyVector3d): void {
		this.xAxis.setVector(x);
		this.xAxis.normalize();
		this.yAxis.setVector(z.getNormalizedCrossProduct(this.xAxis));
		this.zAxis.setVector(x.getCrossProduct(this.yAxis));
	}

	setYZ(y: ReadonlyVector3d, z: ReadonlyVector3d): void {
		this.yAxis.setVector(y);
		this.yAxis.normalize();
		this.xAxis.setVector(y.getNormalizedCrossProduct(z));
		this.zAxis.setVector(this.xAxis.getCrossProduct(this.yAxis));
	}

	setCoordSystem(coordSystem: ReadonlyCoordSystem3d): void {
		this.position.setVector(coordSystem.position);
		this.xAxis.setVector(coordSystem.xAxis);
		this.yAxis.setVector(coordSystem.yAxis);
		this.zAxis.setVector(coordSystem.zAxis);
	}
}