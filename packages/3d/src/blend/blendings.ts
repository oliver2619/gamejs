import { AdditiveBlending } from "./additive-blending";
import { SubtractiveBlending } from "./subtractive-blending";
import { MultiplicativeBlending } from "./multiplicative-blending";
import { AlphaBlending } from "./alpha-blending";
import { ColorAlphaBlending } from "./color-alpha-blending";
import { NoBlending } from "./no-blending";
import { ReadonlyColor } from "@pluto/core";
import { Blending } from "./blending";
import { CustomBlending } from "./custom-blending";

export class Blendings {

	static readonly ADD: Blending = AdditiveBlending.ADD;
	static readonly ADD_ALPHA: Blending = AdditiveBlending.ADD_ALPHA;
	static readonly ALPHA: Blending = AlphaBlending.ALPHA;
	static readonly ALPHA_BINARY: Blending = NoBlending.ALPHA_BINARY;
	static readonly INVERSE_ALPHA: Blending = AlphaBlending.INVERSE_ALPHA;
	static readonly INVERSE_ALPHA_BINARY: Blending = NoBlending.INVERSE_ALPHA_BINARY;
	static readonly MULTIPLY: Blending = MultiplicativeBlending.MULTIPLY;
	static readonly MULTIPLY_ALPHA: Blending = MultiplicativeBlending.MULTIPLY_ALPHA;
	static readonly MULTIPLY_INVERSE: Blending = MultiplicativeBlending.MULTIPLY_INVERSE;
	static readonly MULTIPLY_INVERSE_ALPHA: Blending = MultiplicativeBlending.MULTIPLY_INVERSE_ALPHA;
	static readonly NONE: Blending = NoBlending.NONE;
	static readonly SUBTRACT: Blending = SubtractiveBlending.SUBTRACT;
	static readonly SUBTRACT_ALPHA: Blending = SubtractiveBlending.SUBTRACT_ALPHA;

	static colorAlpha(color: ReadonlyColor): Blending {
		return new ColorAlphaBlending(color);
	}

	static custom(srcFactor: GLenum, dstFactor: GLenum, equation: GLenum): Blending {
		return new CustomBlending(srcFactor, dstFactor, equation);
	}
}