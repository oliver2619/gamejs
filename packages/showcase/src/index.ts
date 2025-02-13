import { ColorBackground3d, Component3d, DefaultScene3d, PerspectiveCamera, Viewport3d } from "@ge/3d";
import { Color, Rect2d } from "@ge/common";

let component: Component3d | undefined;
const camera = new PerspectiveCamera();

function show(id: string) {
    const scene = new DefaultScene3d();
    scene.background = new ColorBackground3d(new Color(0.2, 0.3, 0.4));
    component!.addViewport(new Viewport3d({
        camera,
        scene,
        mapping: size => {
            return new Rect2d(0, 0, size.x - 10, size.y)
        }
    }));
}

window.setTimeout(() => {
    const el = document.getElementById('canvas') as HTMLCanvasElement | null;
    if (el != null) {
        component = Component3d.create(el, { antialias: true, autoRender: true, fps: 10 });
        document
            .querySelectorAll('[data-showcase]')
            .forEach(it => {
                const element = it as HTMLElement;
                element.onclick = () => {
                    component!.clearViewports();
                    show(element.getAttribute('data-showcase')!!);
                };
            });
    }
}, 1);
