import { Color, ImageCache, ImageCacheAlphaOperation } from "@pluto/core";
import { Animations2dShowcase as Animations2dShowcase } from "./2d/animations-2d-showcase";
import { Showcase, ShowcaseFactory } from "./showcase";
import { Material2dCache } from "@pluto/2d";
import { Physics2dShowcase } from "./2d/physics-2d-showcase";

const showcases: { [key: string]: ShowcaseFactory } = {
    'animations2d': Animations2dShowcase,
    'physics2d': Physics2dShowcase
};

let current: Showcase | undefined;

function show(id: string) {
    if (current != undefined) {
        current.destroy();
    }
    const content = document.getElementById('content');
    if (content != null) {
        content.innerHTML = '';
        const ctor = showcases[id];
        if (ctor != undefined) {
            current = new ctor();
            current.create(content)
        }
    }
}

function init() {
    ImageCache.register('pattern', 'pattern.jpg', ImageCacheAlphaOperation.KEEP_OPAQUE, 1);
    ImageCache.register('texture', 'texture.png', ImageCacheAlphaOperation.KEEP_TRANSPARENT, 1);
    Material2dCache.registerColorStyle('green', new Color(0, 0.5, 0));
    Material2dCache.registerColorStyle('white', new Color(1, 1, 1));
    Material2dCache.registerPatternStyle('pattern', {
        image: 'pattern',
        scale: 0.2
    });
    Material2dCache.registerPatternStyle('texture', {
        image: 'texture',
    });
    Material2dCache.registerMaterial('green', { fill: 'green', stroke: 'green' });
    Material2dCache.registerMaterial('pattern', { fill: 'pattern', stroke: 'white' });
    Material2dCache.registerMaterial('texture', { fill: 'texture', stroke: 'white' });
}

window.setTimeout(() => {
    init();
    let defaultId: string | undefined;
    document
        .querySelectorAll('[data-showcase]')
        .forEach(it => {
            const element = it as HTMLElement;
            const id = element.getAttribute('data-showcase')!;
            if (defaultId == undefined) {
                defaultId = id;
            }
            element.onclick = () => {
                show(id);
            };
        });
    if (defaultId != undefined) {
        show(defaultId);
    }
}, 1);
