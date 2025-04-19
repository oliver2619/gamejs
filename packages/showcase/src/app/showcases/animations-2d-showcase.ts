import { Camera2dAnimations, ColorPostEffect, Material2dCache, Object2d, Object2dAnimations, ObjectLayer, PathBuilder, PathSolid2d, RadialGradientBackground } from "@pluto/2d";
import { AnimationBuilder, AnimationLoopMode, Animations, Color, TransitionFunctions, Vector2d } from "@pluto/core";
import { Showcase2d } from "../showcase-2d";

export class Animations2dShowcase extends Showcase2d {

    protected onInit(): void {
        this.camera.updateCoordSystem(cb => cb.rotation = 0);
        // Material2dCache.getPaintStyle('pattern').then(pattern => scene.background = new PatternBackground({
        //     pattern: pattern as PatternStyle,
        //     filter: {blur: 2}
        // }));
        this.scene.background = new RadialGradientBackground({
            colorStops: [
                { offset: 0, color: new Color(1, 0.8, 0) },
                { offset: 0.1, color: new Color(0.8, 0.8, 0.8) },
                { offset: 0.2, color: new Color(0, .5, 1) },
                { offset: 1, color: new Color(0, .3, 0.5) }
            ],
            start: new Vector2d(0.5, 0.1),
            end: new Vector2d(0.5, -3),
            radius: 4
        });
        const layer = new ObjectLayer({});
        const path = new PathBuilder().circle(0, 100, 20).circle(0, -100, 20).rectangle(-100, -100, 200, 200).polygon([[100, 100], [120, 0], [100, -100]]).build();
        const obj = new Object2d();
        Material2dCache.GLOBAL.getMaterial('texture').then(material => {
            obj.addPart(new PathSolid2d({ path, material, stroke: true, fill: 'evenodd' }));
        });
        layer.addPart(obj);
        layer.rebuild();
        this.scene.addLayer(layer);
        const postEffect = new ColorPostEffect({ color: new Color(0, 0, 0), blendOperation: 'multiply' });
        this.scene.postEffect = postEffect;
        this.addAnimation(obj, AnimationBuilder.finite(0.5).repetitions(10).pause(0.5).delay(0.5).transition(TransitionFunctions.FADE).onAnimate(Object2dAnimations.rotateFiniteRelative(obj, 0.5)));
        this.addAnimation(obj, AnimationBuilder.finite(0.8127).repetitions(12).delay(5).transition(TransitionFunctions.greaterThan(0.9)).loop(AnimationLoopMode.BOTH).onAnimate(Object2dAnimations.scaleFiniteRelative(obj, 1.2)));
        this.addAnimation(obj, AnimationBuilder.finite(1).repetitions(10).loop(AnimationLoopMode.BOTH).transition(TransitionFunctions.FADE).onAnimate(Object2dAnimations.translateFiniteTo(obj, new Vector2d(100, 25))));
        this.addAnimation(obj, AnimationBuilder.finite(0.112).repetitions(20).loop(AnimationLoopMode.BOTH).transition(TransitionFunctions.SQUARE).onAnimate(Object2dAnimations.translateFiniteRelative(obj, new Vector2d(0, 10))));
        this.addAnimation(this.camera, AnimationBuilder.infinite().onAnimate(Camera2dAnimations.zoomInfiniteAlong(this.camera, ev => 1 + 0.3 * Math.sin(ev.totalTime * 5))));
        this.addAnimation(this.camera, AnimationBuilder.infinite().onAnimate(Object2dAnimations.translateInfiniteAlong(this.camera, (ev, position) => {
            position.x = 300 * Math.sin(ev.totalTime);
            position.y = 300 * Math.cos(ev.totalTime);
        })));
        this.addAnimation(obj, AnimationBuilder.finite(1).onAnimate(Animations.fadeValueFiniteTo(obj, 'alpha', 0.5)));
        this.addAnimation(postEffect, AnimationBuilder.finite(1).transition(TransitionFunctions.FADE_IN).onAnimate(Animations.fadeColorFiniteTo(postEffect, 'color', new Color(0, 1, 1))));
        this.addAnimation(postEffect, AnimationBuilder.finite(1).transition(TransitionFunctions.FADE_OUT).onAnimate(Animations.fadeColorFiniteTo(postEffect, 'color', new Color(1, 0, 0))));
    }
}