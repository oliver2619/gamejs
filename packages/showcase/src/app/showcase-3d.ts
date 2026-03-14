import { CanvasAdapter3d, DefaultScene3d, PerspectiveCamera, Viewport3d } from "@pluto/3d";
import { AnimationBuilder } from "@pluto/core";

export abstract class Showcase3d {

    private readonly camera = new PerspectiveCamera();
    private readonly scene = new DefaultScene3d();

    private adapter: CanvasAdapter3d | undefined;

    init(adapter: CanvasAdapter3d) {
        this.adapter = adapter;
        adapter.addViewport(new Viewport3d({
            camera: this.camera,
            scene: this.scene,
            // mapping: s => new Rectangle(s.x * 0.1, s.y * 0.2, s.x * 0.8, s.y * 0.6)
        }));
        this.adapter.addAnimation(this, AnimationBuilder.infinite().onAnimate(() => { }));
        this.initScene(this.scene);
    }

    protected abstract initScene(scene: DefaultScene3d): void;
}