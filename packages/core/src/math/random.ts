/**
 * Implementation of KISS. Maybe not correct related to Javascript number limitations.
 */
export class Random {

    private static MAX = Math.pow(2, 32);

    private x = 0;
    private y = 0;
    private z = 0;
    private c = 0;

    private gaussian: number | null = null;

    constructor(seed?: number | string) {
        if (seed !== undefined)
            this.seed(seed);
        else
            this.seed(performance.now());
    }

    next(): number {
        this.x = (69069 * this.x + 12345) % Random.MAX;
        this.x |= 0;

        this.y ^= this.y << 13;
        this.y ^= this.y >> 17;
        this.y ^= this.y << 5;

        let t = 698769069 * this.z + this.c;
        this.c = t >> 32;
        this.z = t % Random.MAX;

        let ret = this.x + this.y + this.z;
        if (ret < 0)
            ret += Random.MAX * 2;
        return (ret % Random.MAX) / Random.MAX;
    }

    nextGaussian(): number {
        if (this.gaussian !== null) {
            const ret = this.gaussian;
            this.gaussian = null;
            return ret;
        }
        for (let i = 0; i < 1000; ++i) {
            const v1 = this.next() * 2 - 1;
            const v2 = this.next() * 2 - 1;
            const q = v1 * v1 + v2 * v2;
            if (q > 0 && q < 1) {
                const p = Math.sqrt(-2 * Math.log(q) / q);
                this.gaussian = v2 * p;
                return v1 * p;
            }
        }
        throw new Error('Generation of gaussian distributed random number failed');
    }

    seed(seed: number | string | undefined): void {
        const s = Random.seedFromInput(seed);
        const s2 = s * s;
        this.x = (Math.sin(s2 * 43) * .5 + .5) * (Random.MAX - 1) | 0;
        this.y = (Math.cos(s2 * 19 + s * 62) * .5 + .5) * (Random.MAX - 1) | 0;
        this.z = (Math.cos(s2 * 57) * .5 + .5) * (Random.MAX - 1) | 0;
        this.c = (Math.sin(s2 * 80 + s * 102 + 3954) * .5 + .5) * (Random.MAX - 1) | 0;
    }

    private static seedFromInput(seed: number | string | undefined): number {
        if (seed == undefined) {
            return performance.now();
        } else if (typeof seed === 'number') {
            return seed;
        }
        let ret: number = 0;
        for (let i = 0; i < seed.length; ++i) {
            ret = (((ret << 5) - ret) + seed.charCodeAt(i));
        }
        return ret;
    }
}