    // value * m * r * r
    export class CircleRelativeMomentsOfInertia {
    static readonly SOLID_SPHERE = 2 / 5;
    static readonly HOLLOW_SPHERE = 2 / 3;
    static readonly SOLID_CYLINDER = 1 / 2;
    static readonly HOLLOW_CYLINDER = 1;
    static readonly SOLID_CONE = 3 / 10;
    static readonly HOLLOW_CONE = 1 / 2;
}

export class MomentsOfInertia {

    // value * m
    static solidRect(width: number, height: number) {
        return (width * width + height * height) / 12;
    }
}