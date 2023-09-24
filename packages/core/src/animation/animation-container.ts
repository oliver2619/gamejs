import { Animation } from "./animation";

export interface AnimationContainer extends Animation {

    addAnimation(animation: Animation): void;
}
