export interface Blending {

    readonly supportsLighting: boolean;
    readonly transparent: boolean;

    use(): void;
}