import { ReadonlyVector3, Vector3 } from "./vector3";

function MAT(m: Float32Array, r: number, c: number): number {
    return m[c * 4 + r];
}

function MATS(m: Float32Array, r: number, c: number, v: number): void {
    m[c * 4 + r] = v;
}

export class ReadonlyMatrix4 {

    get determinant(): number {
        const m = this._values;
        let ret = m[0] * (m[5] * (m[10] * m[15] - m[11] * m[14]) + m[9] * (m[7] * m[14] - m[6] * m[15]) + m[13] * (m[6] * m[11] - m[7] * m[10]));
        ret -= m[1] * (m[4] * (m[10] * m[15] - m[11] * m[14]) + m[8] * (m[7] * m[14] - m[6] * m[15]) + m[12] * (m[6] * m[11] - m[7] * m[10]));
        ret += m[2] * (m[4] * (m[9] * m[15] - m[11] * m[13]) + m[8] * (m[7] * m[13] - m[5] * m[15]) + m[12] * (m[5] * m[11] - m[7] * m[9]));
        ret -= m[3] * (m[4] * (m[9] * m[14] - m[10] * m[13]) + m[8] * (m[6] * m[13] - m[5] * m[14]) + m[12] * (m[5] * m[10] - m[6] * m[9]));
        return ret;
    }

    get values(): Float32Array { return this._values; }

    protected constructor(protected _values: Float32Array) { }

    clone(): Matrix4 {
        return new Matrix4(this._values.map(v => v));
    }

    /**
     * Original code from GLU openGL utility library.
     */
    getInverted(): Matrix4 {
        const out = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
        const m = this._values;
        const wtmp: Array<number[]> = [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]];
        let m0: number, m1: number, m2: number, m3: number, s: number;
        let r0: number[], r1: number[], r2: number[], r3: number[], rTmp: number[];

        r0 = wtmp[0];
        r1 = wtmp[1];
        r2 = wtmp[2];
        r3 = wtmp[3];
        r0[0] = MAT(m, 0, 0);
        r0[1] = MAT(m, 0, 1);
        r0[2] = MAT(m, 0, 2);
        r0[3] = MAT(m, 0, 3);
        r0[4] = 1.0;
        r0[5] = r0[6] = r0[7] = 0.0;
        r1[0] = MAT(m, 1, 0);
        r1[1] = MAT(m, 1, 1);
        r1[2] = MAT(m, 1, 2);
        r1[3] = MAT(m, 1, 3);
        r1[5] = 1.0;
        r1[4] = r1[6] = r1[7] = 0.0;
        r2[0] = MAT(m, 2, 0);
        r2[1] = MAT(m, 2, 1);
        r2[2] = MAT(m, 2, 2);
        r2[3] = MAT(m, 2, 3);
        r2[6] = 1.0;
        r2[4] = r2[5] = r2[7] = 0.0;
        r3[0] = MAT(m, 3, 0);
        r3[1] = MAT(m, 3, 1);
        r3[2] = MAT(m, 3, 2);
        r3[3] = MAT(m, 3, 3);
        r3[7] = 1.0;
        r3[4] = r3[5] = r3[6] = 0.0;

        // choose pivot - or die
        if (Math.abs(r3[0]) > Math.abs(r2[0])) {
            rTmp = r3;
            r3 = r2;
            r2 = rTmp;
        }
        if (Math.abs(r2[0]) > Math.abs(r1[0])) {
            rTmp = r2;
            r2 = r1;
            r1 = rTmp;
        }
        if (Math.abs(r1[0]) > Math.abs(r0[0])) {
            rTmp = r1;
            r1 = r0;
            r0 = rTmp;
        }
        if (0.0 === r0[0]) {
            console.warn('Failure with inverting matrix');
            // console.log(this._values);
        }
        // eliminate first variable
        m1 = r1[0] / r0[0];
        m2 = r2[0] / r0[0];
        m3 = r3[0] / r0[0];
        s = r0[1];
        r1[1] -= m1 * s;
        r2[1] -= m2 * s;
        r3[1] -= m3 * s;
        s = r0[2];
        r1[2] -= m1 * s;
        r2[2] -= m2 * s;
        r3[2] -= m3 * s;
        s = r0[3];
        r1[3] -= m1 * s;
        r2[3] -= m2 * s;
        r3[3] -= m3 * s;
        s = r0[4];
        if (s !== 0.0) {
            r1[4] -= m1 * s;
            r2[4] -= m2 * s;
            r3[4] -= m3 * s;
        }
        s = r0[5];
        if (s !== 0.0) {
            r1[5] -= m1 * s;
            r2[5] -= m2 * s;
            r3[5] -= m3 * s;
        }
        s = r0[6];
        if (s !== 0.0) {
            r1[6] -= m1 * s;
            r2[6] -= m2 * s;
            r3[6] -= m3 * s;
        }
        s = r0[7];
        if (s !== 0.0) {
            r1[7] -= m1 * s;
            r2[7] -= m2 * s;
            r3[7] -= m3 * s;
        }
        // choose pivot - or die 
        if (Math.abs(r3[1]) > Math.abs(r2[1])) {
            rTmp = r3;
            r3 = r2;
            r2 = rTmp;
        }
        if (Math.abs(r2[1]) > Math.abs(r1[1])) {
            rTmp = r2;
            r2 = r1;
            r1 = rTmp;
        }
        if (0.0 === r1[1]) {
            console.warn('Failure with inverting matrix');
            // console.log(this._values);
        }
        // eliminate second variable 
        m2 = r2[1] / r1[1];
        m3 = r3[1] / r1[1];
        r2[2] -= m2 * r1[2];
        r3[2] -= m3 * r1[2];
        r2[3] -= m2 * r1[3];
        r3[3] -= m3 * r1[3];
        s = r1[4];
        if (0.0 !== s) {
            r2[4] -= m2 * s;
            r3[4] -= m3 * s;
        }
        s = r1[5];
        if (0.0 !== s) {
            r2[5] -= m2 * s;
            r3[5] -= m3 * s;
        }
        s = r1[6];
        if (0.0 !== s) {
            r2[6] -= m2 * s;
            r3[6] -= m3 * s;
        }
        s = r1[7];
        if (0.0 !== s) {
            r2[7] -= m2 * s;
            r3[7] -= m3 * s;
        }
        if (Math.abs(r3[2]) > Math.abs(r2[2])) {
            rTmp = r3;
            r3 = r2;
            r2 = rTmp;
        }
        if (0.0 === r2[2]) {
            console.warn('Failure with inverting matrix');
            // console.log(this._values);
        }
        // eliminate third variable 
        m3 = r3[2] / r2[2];
        r3[3] -= m3 * r2[3];
        r3[4] -= m3 * r2[4];
        r3[5] -= m3 * r2[5];
        r3[6] -= m3 * r2[6];
        r3[7] -= m3 * r2[7];
        // choose pivot - or die 
        // last check 
        if (0.0 === r3[3]) {
            console.warn('Failure with inverting matrix');
            // console.log(this._values);
        }
        s = 1.0 / r3[3];		// now back substitute row 3 
        r3[4] *= s;
        r3[5] *= s;
        r3[6] *= s;
        r3[7] *= s;
        m2 = r2[3];			// now back substitute row 2 
        s = 1.0 / r2[2];

        r2[4] = s * (r2[4] - r3[4] * m2);
        r2[5] = s * (r2[5] - r3[5] * m2);
        r2[6] = s * (r2[6] - r3[6] * m2);
        r2[7] = s * (r2[7] - r3[7] * m2);
        m1 = r1[3];
        r1[4] -= r3[4] * m1;
        r1[5] -= r3[5] * m1;
        r1[6] -= r3[6] * m1;
        r1[7] -= r3[7] * m1;
        m0 = r0[3];
        r0[4] -= r3[4] * m0;
        r0[5] -= r3[5] * m0;
        r0[6] -= r3[6] * m0;
        r0[7] -= r3[7] * m0;
        m1 = r1[2];			// now back substitute row 1 
        s = 1.0 / r1[1];
        r1[4] = s * (r1[4] - r2[4] * m1);
        r1[5] = s * (r1[5] - r2[5] * m1);
        r1[6] = s * (r1[6] - r2[6] * m1);
        r1[7] = s * (r1[7] - r2[7] * m1);
        m0 = r0[2];
        r0[4] -= r2[4] * m0;
        r0[5] -= r2[5] * m0;
        r0[6] -= r2[6] * m0;
        r0[7] -= r2[7] * m0;
        m0 = r0[1];			// now back substitute row 0 
        s = 1.0 / r0[0];
        r0[4] = s * (r0[4] - r1[4] * m0);
        r0[5] = s * (r0[5] - r1[5] * m0);
        r0[6] = s * (r0[6] - r1[6] * m0);
        r0[7] = s * (r0[7] - r1[7] * m0);

        MATS(out, 0, 0, r0[4]);
        MATS(out, 0, 1, r0[5]);
        MATS(out, 0, 2, r0[6]);
        MATS(out, 0, 3, r0[7]);
        MATS(out, 1, 0, r1[4]);
        MATS(out, 1, 1, r1[5]);
        MATS(out, 1, 2, r1[6]);
        MATS(out, 1, 3, r1[7]);
        MATS(out, 2, 0, r2[4]);
        MATS(out, 2, 1, r2[5]);
        MATS(out, 2, 2, r2[6]);
        MATS(out, 2, 3, r2[7]);
        MATS(out, 3, 0, r3[4]);
        MATS(out, 3, 1, r3[5]);
        MATS(out, 3, 2, r3[6]);
        MATS(out, 3, 3, r3[7]);

        return new Matrix4(out);
    }

    /**
     * @returns this * other
     */
    getPostMultiplied(other: ReadonlyMatrix4): Matrix4 {
        const ov = other.values;
        return new Matrix4(new Float32Array([
            this._values[0] * ov[0] + this._values[4] * ov[1] + this._values[8] * ov[2] + this._values[12] * ov[3],
            this._values[1] * ov[0] + this._values[5] * ov[1] + this._values[9] * ov[2] + this._values[13] * ov[3],
            this._values[2] * ov[0] + this._values[6] * ov[1] + this._values[10] * ov[2] + this._values[14] * ov[3],
            this._values[3] * ov[0] + this._values[7] * ov[1] + this._values[11] * ov[2] + this._values[15] * ov[3],
            this._values[0] * ov[4] + this._values[4] * ov[5] + this._values[8] * ov[6] + this._values[12] * ov[7],
            this._values[1] * ov[4] + this._values[5] * ov[5] + this._values[9] * ov[6] + this._values[13] * ov[7],
            this._values[2] * ov[4] + this._values[6] * ov[5] + this._values[10] * ov[6] + this._values[14] * ov[7],
            this._values[3] * ov[4] + this._values[7] * ov[5] + this._values[11] * ov[6] + this._values[15] * ov[7],
            this._values[0] * ov[8] + this._values[4] * ov[9] + this._values[8] * ov[10] + this._values[12] * ov[11],
            this._values[1] * ov[8] + this._values[5] * ov[9] + this._values[9] * ov[10] + this._values[13] * ov[11],
            this._values[2] * ov[8] + this._values[6] * ov[9] + this._values[10] * ov[10] + this._values[14] * ov[11],
            this._values[3] * ov[8] + this._values[7] * ov[9] + this._values[11] * ov[10] + this._values[15] * ov[11],
            this._values[0] * ov[12] + this._values[4] * ov[13] + this._values[8] * ov[14] + this._values[12] * ov[15],
            this._values[1] * ov[12] + this._values[5] * ov[13] + this._values[9] * ov[14] + this._values[13] * ov[15],
            this._values[2] * ov[12] + this._values[6] * ov[13] + this._values[10] * ov[14] + this._values[14] * ov[15],
            this._values[3] * ov[12] + this._values[7] * ov[13] + this._values[11] * ov[14] + this._values[15] * ov[15]
        ]));
    }

    /**
     * @returns m * v
     */
    getPostMultipliedWithVector(v: ReadonlyVector3, w: number): Vector3 {
        return new Vector3(
            this._values[0] * v.x + this._values[4] * v.y + this._values[8] * v.z + this._values[12] * w,
            this._values[1] * v.x + this._values[5] * v.y + this._values[9] * v.z + this._values[13] * w,
            this._values[2] * v.x + this._values[6] * v.y + this._values[10] * v.z + this._values[14] * w
        );
    }

    /**
     * @returns m * v
     */
    getPostMultipliedWithVector4(v: ReadonlyVector3, w: number): number[] {
        return [
            this._values[0] * v.x + this._values[4] * v.y + this._values[8] * v.z + this._values[12] * w,
            this._values[1] * v.x + this._values[5] * v.y + this._values[9] * v.z + this._values[13] * w,
            this._values[2] * v.x + this._values[6] * v.y + this._values[10] * v.z + this._values[14] * w,
            this._values[3] * v.x + this._values[7] * v.y + this._values[11] * v.z + this._values[15] * w
        ];
    }
}

/**
 * Matrix is defined as follows:
 * 
 * |  m0  m4   m8  m12  |  0
 * |  m1  m5   m9  m13  |  1
 * |  m2  m6  m10  m14  |  2
 * |  m3  m7  m11  m15  |  3
 * 
 *     0   1    2    3
 */
export class Matrix4 extends ReadonlyMatrix4 {

    constructor(values: Float32Array) {
        super(values);
    }

    static create(position?: ReadonlyVector3): Matrix4 {
        let x: number;
        let y: number;
        let z: number;
        if (position !== undefined) {
            x = position.x;
            y = position.y;
            z = position.z;
        } else {
            x = 0;
            y = 0;
            z = 0;
        }
        return new Matrix4(new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]));
    }

    /**
     * n near
     * f far
     * r right
     * l left
     * t top
     * b bottom
     * 
     * |  2n/(r-l)     0            0       n(r+l)/(l-r)  |
     * |     0      2n/(t-b)        0       n(t+b)/(b-t)  |
     * |     0         0       (f+n)/(n-f)    2fn/(n-f)   |
     * |     0         0           -1             0       |
     * 
     */
    frustum(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4 {
        this._values[0] = 2 * near / (right - left);
        this._values[1] = 0;
        this._values[2] = 0;
        this._values[3] = 0;
        this._values[4] = 0;
        this._values[5] = 2 * near / (top - bottom);
        this._values[6] = 0;
        this._values[7] = 0;
        this._values[8] = 0;
        this._values[9] = 0;
        this._values[10] = (far + near) / (near - far);
        this._values[11] = -1;
        this._values[12] = near * (right + left) / (left - right);
        this._values[13] = near * (top + bottom) / (bottom - top);
        this._values[14] = 2 * far * near / (near - far);
        this._values[15] = 0;
        return this;
    }

    /**
     * Original code from GLU openGL utility library.
     */
    invert(): void {
        const out = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
        const m = this._values;
        const wtmp: Array<number[]> = [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]];
        let m0: number, m1: number, m2: number, m3: number, s: number;
        let r0: number[], r1: number[], r2: number[], r3: number[], rTmp: number[];

        r0 = wtmp[0];
        r1 = wtmp[1];
        r2 = wtmp[2];
        r3 = wtmp[3];
        r0[0] = MAT(m, 0, 0);
        r0[1] = MAT(m, 0, 1);
        r0[2] = MAT(m, 0, 2);
        r0[3] = MAT(m, 0, 3);
        r0[4] = 1.0;
        r0[5] = r0[6] = r0[7] = 0.0;
        r1[0] = MAT(m, 1, 0);
        r1[1] = MAT(m, 1, 1);
        r1[2] = MAT(m, 1, 2);
        r1[3] = MAT(m, 1, 3);
        r1[5] = 1.0;
        r1[4] = r1[6] = r1[7] = 0.0;
        r2[0] = MAT(m, 2, 0);
        r2[1] = MAT(m, 2, 1);
        r2[2] = MAT(m, 2, 2);
        r2[3] = MAT(m, 2, 3);
        r2[6] = 1.0;
        r2[4] = r2[5] = r2[7] = 0.0;
        r3[0] = MAT(m, 3, 0);
        r3[1] = MAT(m, 3, 1);
        r3[2] = MAT(m, 3, 2);
        r3[3] = MAT(m, 3, 3);
        r3[7] = 1.0;
        r3[4] = r3[5] = r3[6] = 0.0;

        // choose pivot - or die
        if (Math.abs(r3[0]) > Math.abs(r2[0])) {
            rTmp = r3;
            r3 = r2;
            r2 = rTmp;
        }
        if (Math.abs(r2[0]) > Math.abs(r1[0])) {
            rTmp = r2;
            r2 = r1;
            r1 = rTmp;
        }
        if (Math.abs(r1[0]) > Math.abs(r0[0])) {
            rTmp = r1;
            r1 = r0;
            r0 = rTmp;
        }
        if (0.0 === r0[0]) {
            console.warn('Failure with inverting matrix');
            console.log(this._values);
        }
        // eliminate first variable
        m1 = r1[0] / r0[0];
        m2 = r2[0] / r0[0];
        m3 = r3[0] / r0[0];
        s = r0[1];
        r1[1] -= m1 * s;
        r2[1] -= m2 * s;
        r3[1] -= m3 * s;
        s = r0[2];
        r1[2] -= m1 * s;
        r2[2] -= m2 * s;
        r3[2] -= m3 * s;
        s = r0[3];
        r1[3] -= m1 * s;
        r2[3] -= m2 * s;
        r3[3] -= m3 * s;
        s = r0[4];
        if (s !== 0.0) {
            r1[4] -= m1 * s;
            r2[4] -= m2 * s;
            r3[4] -= m3 * s;
        }
        s = r0[5];
        if (s !== 0.0) {
            r1[5] -= m1 * s;
            r2[5] -= m2 * s;
            r3[5] -= m3 * s;
        }
        s = r0[6];
        if (s !== 0.0) {
            r1[6] -= m1 * s;
            r2[6] -= m2 * s;
            r3[6] -= m3 * s;
        }
        s = r0[7];
        if (s !== 0.0) {
            r1[7] -= m1 * s;
            r2[7] -= m2 * s;
            r3[7] -= m3 * s;
        }
        // choose pivot - or die 
        if (Math.abs(r3[1]) > Math.abs(r2[1])) {
            rTmp = r3;
            r3 = r2;
            r2 = rTmp;
        }
        if (Math.abs(r2[1]) > Math.abs(r1[1])) {
            rTmp = r2;
            r2 = r1;
            r1 = rTmp;
        }
        if (0.0 === r1[1]) {
            console.warn('Failure with inverting matrix');
            console.log(this._values);
        }
        // eliminate second variable 
        m2 = r2[1] / r1[1];
        m3 = r3[1] / r1[1];
        r2[2] -= m2 * r1[2];
        r3[2] -= m3 * r1[2];
        r2[3] -= m2 * r1[3];
        r3[3] -= m3 * r1[3];
        s = r1[4];
        if (0.0 !== s) {
            r2[4] -= m2 * s;
            r3[4] -= m3 * s;
        }
        s = r1[5];
        if (0.0 !== s) {
            r2[5] -= m2 * s;
            r3[5] -= m3 * s;
        }
        s = r1[6];
        if (0.0 !== s) {
            r2[6] -= m2 * s;
            r3[6] -= m3 * s;
        }
        s = r1[7];
        if (0.0 !== s) {
            r2[7] -= m2 * s;
            r3[7] -= m3 * s;
        }
        if (Math.abs(r3[2]) > Math.abs(r2[2])) {
            rTmp = r3;
            r3 = r2;
            r2 = rTmp;
        }
        if (0.0 === r2[2]) {
            console.warn('Failure with inverting matrix');
            console.log(this._values);
        }
        // eliminate third variable 
        m3 = r3[2] / r2[2];
        r3[3] -= m3 * r2[3];
        r3[4] -= m3 * r2[4];
        r3[5] -= m3 * r2[5];
        r3[6] -= m3 * r2[6];
        r3[7] -= m3 * r2[7];
        // choose pivot - or die 
        // last check 
        if (0.0 === r3[3]) {
            console.warn('Failure with inverting matrix');
            console.log(this._values);
        }
        s = 1.0 / r3[3];		// now back substitute row 3 
        r3[4] *= s;
        r3[5] *= s;
        r3[6] *= s;
        r3[7] *= s;
        m2 = r2[3];			// now back substitute row 2 
        s = 1.0 / r2[2];

        r2[4] = s * (r2[4] - r3[4] * m2);
        r2[5] = s * (r2[5] - r3[5] * m2);
        r2[6] = s * (r2[6] - r3[6] * m2);
        r2[7] = s * (r2[7] - r3[7] * m2);
        m1 = r1[3];
        r1[4] -= r3[4] * m1;
        r1[5] -= r3[5] * m1;
        r1[6] -= r3[6] * m1;
        r1[7] -= r3[7] * m1;
        m0 = r0[3];
        r0[4] -= r3[4] * m0;
        r0[5] -= r3[5] * m0;
        r0[6] -= r3[6] * m0;
        r0[7] -= r3[7] * m0;
        m1 = r1[2];			// now back substitute row 1 
        s = 1.0 / r1[1];
        r1[4] = s * (r1[4] - r2[4] * m1);
        r1[5] = s * (r1[5] - r2[5] * m1);
        r1[6] = s * (r1[6] - r2[6] * m1);
        r1[7] = s * (r1[7] - r2[7] * m1);
        m0 = r0[2];
        r0[4] -= r2[4] * m0;
        r0[5] -= r2[5] * m0;
        r0[6] -= r2[6] * m0;
        r0[7] -= r2[7] * m0;
        m0 = r0[1];			// now back substitute row 0 
        s = 1.0 / r0[0];
        r0[4] = s * (r0[4] - r1[4] * m0);
        r0[5] = s * (r0[5] - r1[5] * m0);
        r0[6] = s * (r0[6] - r1[6] * m0);
        r0[7] = s * (r0[7] - r1[7] * m0);

        MATS(out, 0, 0, r0[4]);
        MATS(out, 0, 1, r0[5]);
        MATS(out, 0, 2, r0[6]);
        MATS(out, 0, 3, r0[7]);
        MATS(out, 1, 0, r1[4]);
        MATS(out, 1, 1, r1[5]);
        MATS(out, 1, 2, r1[6]);
        MATS(out, 1, 3, r1[7]);
        MATS(out, 2, 0, r2[4]);
        MATS(out, 2, 1, r2[5]);
        MATS(out, 2, 2, r2[6]);
        MATS(out, 2, 3, r2[7]);
        MATS(out, 3, 0, r3[4]);
        MATS(out, 3, 1, r3[5]);
        MATS(out, 3, 2, r3[6]);
        MATS(out, 3, 3, r3[7]);

        this._values = out;
    }

    lookThrough(position: ReadonlyVector3, xAxis: ReadonlyVector3, yAxis: ReadonlyVector3, zAxis: ReadonlyVector3): Matrix4 {
        this.reset();
        this.preMultiply(xAxis.x, yAxis.x, zAxis.x, 0, xAxis.y, yAxis.y, zAxis.y, 0, xAxis.z, yAxis.z, zAxis.z, 0, 0, 0, 0, 1);
        this.translate(-position.x, -position.y, -position.z);
        return this;
    }

    multiplyModelView(position: ReadonlyVector3, xAxis: ReadonlyVector3, yAxis: ReadonlyVector3, zAxis: ReadonlyVector3): Matrix4 {
        this.preMultiply(xAxis.x, xAxis.y, xAxis.z, 0, yAxis.x, yAxis.y, yAxis.z, 0, zAxis.x, zAxis.y, zAxis.z, 0, position.x, position.y, position.z, 1);
        return this;
    }

    ortho(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4 {
        this._values[0] = 2 / (right - left);
        this._values[1] = 0;
        this._values[2] = 0;
        this._values[3] = 0;
        this._values[4] = 0;
        this._values[5] = 2 / (top - bottom);
        this._values[6] = 0;
        this._values[7] = 0;
        this._values[8] = 0;
        this._values[9] = 0;
        this._values[10] = -2 / (far - near);
        this._values[11] = 0;
        this._values[12] = - (right + left) / (right - left);
        this._values[13] = - (top + bottom) / (top - bottom);
        this._values[14] = -(far + near) / (far - near);
        this._values[15] = 1;
        return this;
    }

    preMultiplyMatrix(matrix: ReadonlyMatrix4): Matrix4 {
        const mv = matrix.values;
        const y0 = mv[0] * this._values[0] + mv[1] * this._values[4] + mv[2] * this._values[8] + mv[3] * this._values[12];
        const y1 = mv[0] * this._values[1] + mv[1] * this._values[5] + mv[2] * this._values[9] + mv[3] * this._values[13];
        const y2 = mv[0] * this._values[2] + mv[1] * this._values[6] + mv[2] * this._values[10] + mv[3] * this._values[14];
        const y3 = mv[0] * this._values[3] + mv[1] * this._values[7] + mv[2] * this._values[11] + mv[3] * this._values[15];
        const y4 = mv[4] * this._values[0] + mv[5] * this._values[4] + mv[6] * this._values[8] + mv[7] * this._values[12];
        const y5 = mv[4] * this._values[1] + mv[5] * this._values[5] + mv[6] * this._values[9] + mv[7] * this._values[13];
        const y6 = mv[4] * this._values[2] + mv[5] * this._values[6] + mv[6] * this._values[10] + mv[7] * this._values[14];
        const y7 = mv[4] * this._values[3] + mv[5] * this._values[7] + mv[6] * this._values[11] + mv[7] * this._values[15];
        const y8 = mv[8] * this._values[0] + mv[9] * this._values[4] + mv[10] * this._values[8] + mv[11] * this._values[12];
        const y9 = mv[8] * this._values[1] + mv[9] * this._values[5] + mv[10] * this._values[9] + mv[11] * this._values[13];
        const y10 = mv[8] * this._values[2] + mv[9] * this._values[6] + mv[10] * this._values[10] + mv[11] * this._values[14];
        const y11 = mv[8] * this._values[3] + mv[9] * this._values[7] + mv[10] * this._values[11] + mv[11] * this._values[15];
        const y12 = mv[12] * this._values[0] + mv[13] * this._values[4] + mv[14] * this._values[8] + mv[15] * this._values[12];
        const y13 = mv[12] * this._values[1] + mv[13] * this._values[5] + mv[14] * this._values[9] + mv[15] * this._values[13];
        const y14 = mv[12] * this._values[2] + mv[13] * this._values[6] + mv[14] * this._values[10] + mv[15] * this._values[14];
        const y15 = mv[12] * this._values[3] + mv[13] * this._values[7] + mv[14] * this._values[11] + mv[15] * this._values[15];
        this._values[0] = y0;
        this._values[1] = y1;
        this._values[2] = y2;
        this._values[3] = y3;
        this._values[4] = y4;
        this._values[5] = y5;
        this._values[6] = y6;
        this._values[7] = y7;
        this._values[8] = y8;
        this._values[9] = y9;
        this._values[10] = y10;
        this._values[11] = y11;
        this._values[12] = y12;
        this._values[13] = y13;
        this._values[14] = y14;
        this._values[15] = y15;
        return this;
    }

    preMultiply(x0: number, x1: number, x2: number, x3: number, x4: number, x5: number, x6: number, x7: number,
        x8: number, x9: number, x10: number, x11: number, x12: number, x13: number, x14: number, x15: number): Matrix4 {
        const y0 = x0 * this._values[0] + x1 * this._values[4] + x2 * this._values[8] + x3 * this._values[12];
        const y1 = x0 * this._values[1] + x1 * this._values[5] + x2 * this._values[9] + x3 * this._values[13];
        const y2 = x0 * this._values[2] + x1 * this._values[6] + x2 * this._values[10] + x3 * this._values[14];
        const y3 = x0 * this._values[3] + x1 * this._values[7] + x2 * this._values[11] + x3 * this._values[15];
        const y4 = x4 * this._values[0] + x5 * this._values[4] + x6 * this._values[8] + x7 * this._values[12];
        const y5 = x4 * this._values[1] + x5 * this._values[5] + x6 * this._values[9] + x7 * this._values[13];
        const y6 = x4 * this._values[2] + x5 * this._values[6] + x6 * this._values[10] + x7 * this._values[14];
        const y7 = x4 * this._values[3] + x5 * this._values[7] + x6 * this._values[11] + x7 * this._values[15];
        const y8 = x8 * this._values[0] + x9 * this._values[4] + x10 * this._values[8] + x11 * this._values[12];
        const y9 = x8 * this._values[1] + x9 * this._values[5] + x10 * this._values[9] + x11 * this._values[13];
        const y10 = x8 * this._values[2] + x9 * this._values[6] + x10 * this._values[10] + x11 * this._values[14];
        const y11 = x8 * this._values[3] + x9 * this._values[7] + x10 * this._values[11] + x11 * this._values[15];
        const y12 = x12 * this._values[0] + x13 * this._values[4] + x14 * this._values[8] + x15 * this._values[12];
        const y13 = x12 * this._values[1] + x13 * this._values[5] + x14 * this._values[9] + x15 * this._values[13];
        const y14 = x12 * this._values[2] + x13 * this._values[6] + x14 * this._values[10] + x15 * this._values[14];
        const y15 = x12 * this._values[3] + x13 * this._values[7] + x14 * this._values[11] + x15 * this._values[15];
        this._values[0] = y0;
        this._values[1] = y1;
        this._values[2] = y2;
        this._values[3] = y3;
        this._values[4] = y4;
        this._values[5] = y5;
        this._values[6] = y6;
        this._values[7] = y7;
        this._values[8] = y8;
        this._values[9] = y9;
        this._values[10] = y10;
        this._values[11] = y11;
        this._values[12] = y12;
        this._values[13] = y13;
        this._values[14] = y14;
        this._values[15] = y15;
        return this;
    }

    reset(): Matrix4 {
        this.setScale(1, 1, 1, 1);
        return this;
    }

    setScale(x: number, y: number, z: number, w: number): Matrix4 {
        this._values[0] = x;
        this._values[1] = 0;
        this._values[2] = 0;
        this._values[3] = 0;
        this._values[4] = 0;
        this._values[5] = y;
        this._values[6] = 0;
        this._values[7] = 0;
        this._values[8] = 0;
        this._values[9] = 0;
        this._values[10] = z;
        this._values[11] = 0;
        this._values[12] = 0;
        this._values[13] = 0;
        this._values[14] = 0;
        this._values[15] = w;
        return this;
    }

    translate(x: number, y: number, z: number): Matrix4 {
        this.preMultiply(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1);
        return this;
    }
}