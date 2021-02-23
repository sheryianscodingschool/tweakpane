import {
	ColorFormatter,
	colorFromObject,
	colorToHexRgbaString,
	colorToHexRgbString,
} from '../../common/converter/color';
import {Color, RgbaColorObject, RgbColorObject} from '../../common/model/color';
import {CompositeColorParser} from '../../common/reader/string-color';
import {InputBindingPlugin} from '../../input-binding';
import {ColorSwatchTextController} from './controller/color-swatch-text';
import {createColorObjectWriter} from './writer/color';

function shouldSupportAlpha(
	initialValue: RgbColorObject | RgbaColorObject,
): boolean {
	return Color.isRgbaColorObject(initialValue);
}

/**
 * @hidden
 */
export const ObjectColorInputPlugin: InputBindingPlugin<
	Color,
	RgbColorObject | RgbaColorObject
> = {
	id: 'input-color-object',
	binding: {
		accept: (value, _params) => (Color.isColorObject(value) ? value : null),
		reader: (_args) => colorFromObject,
		writer: (args) =>
			createColorObjectWriter(shouldSupportAlpha(args.initialValue)),
		equals: Color.equals,
	},
	controller: (args) => {
		const supportsAlpha = Color.isRgbaColorObject(args.initialValue);
		const formatter = supportsAlpha
			? new ColorFormatter(colorToHexRgbaString)
			: new ColorFormatter(colorToHexRgbString);
		return new ColorSwatchTextController(args.document, {
			formatter: formatter,
			parser: CompositeColorParser,
			supportsAlpha: supportsAlpha,
			value: args.binding.value,
		});
	},
};
