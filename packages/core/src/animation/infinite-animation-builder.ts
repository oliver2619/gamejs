import { Vector2d } from "../math/vector-2d";
import { Vector3d } from "../math/vector-3d";
import { Animation, InfiniteAnimationEvent } from "./animation";
import { InfiniteAnimation } from "./infinite-animation";

export class InfiniteAnimationBuilder {

    onAnimate(callback: (ev: InfiniteAnimationEvent) => void): Animation {
        return new InfiniteAnimation(callback);
    }

    rotateDirection2d(vector: Vector2d, speed: number): Animation {
        return this.onAnimate(ev => {
            vector.rotate(speed * ev.timeout);
            vector.normalize();
        });
    }

    rotateDirection3d(vector: Vector3d, speed: Vector3d): Animation {
        return this.onAnimate(ev => {
            vector.rotate(speed.getScaled(ev.timeout));
            vector.normalize();
        });
    }

    rotateVector2d(vector: Vector2d, center: Vector2d, speed: number): Animation {
        return this.onAnimate(ev => {
            vector.subtract(center);
            vector.rotate(speed * ev.timeout);
            vector.add(center);
        });
    }

    rotateVector3d(vector: Vector3d, center: Vector3d, speed: Vector3d): Animation {
        return this.onAnimate(ev => {
            vector.subtract(center);
            vector.rotate(speed.getScaled(ev.timeout));
            vector.add(center);
        });
    }
}