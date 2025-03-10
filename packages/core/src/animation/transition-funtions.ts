import { TransitionFunction } from "./animation";

export class TransitionFunctions {

	private constructor() { }

	static readonly LINEAR: TransitionFunction = (progress: number) => progress;
	static readonly FADE: TransitionFunction = (progress: number) => { const p = progress * progress; return 3 * p - 2 * p * progress; };
	static readonly FADE_IN: TransitionFunction = (progress: number) => progress * progress;
	static readonly FADE_OUT: TransitionFunction = (progress: number) => 2 * progress - progress * progress;
	static readonly HARMONIC: TransitionFunction = (progress: number) => .5 - .5 * Math.cos(Math.PI * progress);
	static readonly SHAKE: TransitionFunction = (progress: number) => { const a = 4 * (progress - progress * progress); return 1 - a * (Math.random() * 2 - 1); };
	static readonly SHAKE_OUT: TransitionFunction = (progress: number) => { const a = (progress - 1); return 1 - a * a * (Math.random() * 2 - 1); };
	static readonly SINUS: TransitionFunction = (progress: number) => 1 - Math.sin(2 * Math.PI * progress);
	static readonly SQUARE: TransitionFunction = (progress: number) => progress >= 0.5 ? 1 : 0;

	static greaterThan(threshold: number): TransitionFunction {
		return (progress: number) => progress >= threshold ? 1 : 0;
	}

	static sinusOut(frequency: number): TransitionFunction {
		const freq = 2 * Math.PI * frequency;
		return (progress: number) => {
			const a = (progress - 1);
			return 1 - a * a * Math.cos(freq * progress);
		}
	}
}