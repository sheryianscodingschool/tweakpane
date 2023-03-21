import {InputBindingController} from '../../blade/binding/controller/input-binding';
import {NumberInputParams} from '../../blade/common/api/params';
import {ListInputBindingApi} from '../../common/api/list';
import {
	CompositeConstraint,
	findConstraint,
} from '../../common/constraint/composite';
import {Constraint} from '../../common/constraint/constraint';
import {DefiniteRangeConstraint} from '../../common/constraint/definite-range';
import {ListConstraint} from '../../common/constraint/list';
import {ListController} from '../../common/controller/list';
import {numberFromUnknown, parseNumber} from '../../common/converter/number';
import {createListConstraint, parseListOptions} from '../../common/list-util';
import {parseRecord} from '../../common/micro-parsers';
import {ValueMap} from '../../common/model/value-map';
import {createValue} from '../../common/model/values';
import {NumberTextController} from '../../common/number/controller/number-text';
import {
	createSliderTextProps,
	SliderTextController,
} from '../../common/number/controller/slider-text';
import {
	createNumberTextInputParamsParser,
	createNumberTextPropsObject,
	createRangeConstraint,
	createStepConstraint,
} from '../../common/number/util';
import {ListParamsOptions} from '../../common/params';
import {writePrimitive} from '../../common/primitive';
import {VERSION} from '../../version';
import {InputBindingPlugin} from '../plugin';
import {SliderInputBindingApi} from './api/slider';

function createConstraint(
	params: NumberInputParams,
	initialValue: number,
): Constraint<number> {
	const constraints: Constraint<number>[] = [];

	const sc = createStepConstraint(params, initialValue);
	if (sc) {
		constraints.push(sc);
	}
	const rc = createRangeConstraint(params);
	if (rc) {
		constraints.push(rc);
	}
	const lc = createListConstraint<number>(params.options);
	if (lc) {
		constraints.push(lc);
	}

	return new CompositeConstraint(constraints);
}

/**
 * @hidden
 */
export const NumberInputPlugin: InputBindingPlugin<
	number,
	number,
	NumberInputParams
> = {
	id: 'input-number',
	type: 'input',
	core: VERSION,
	accept: (value, params) => {
		if (typeof value !== 'number') {
			return null;
		}
		const result = parseRecord<NumberInputParams>(params, (p) => ({
			...createNumberTextInputParamsParser(p),
			options: p.optional.custom<ListParamsOptions<number>>(parseListOptions),
			readonly: p.optional.constant(false),
		}));
		return result
			? {
					initialValue: value,
					params: result,
			  }
			: null;
	},
	binding: {
		reader: (_args) => numberFromUnknown,
		constraint: (args) => createConstraint(args.params, args.initialValue),
		writer: (_args) => writePrimitive,
	},
	controller: (args) => {
		const value = args.value;
		const c = args.constraint;

		const lc = c && findConstraint<ListConstraint<number>>(c, ListConstraint);
		if (lc) {
			return new ListController(args.document, {
				props: new ValueMap({
					options: lc.values.value('options'),
				}),
				value: value,
				viewProps: args.viewProps,
			});
		}

		const textPropsObj = createNumberTextPropsObject(
			args.params,
			value.rawValue,
		);

		const drc = c && findConstraint(c, DefiniteRangeConstraint);
		if (drc) {
			return new SliderTextController(args.document, {
				...createSliderTextProps({
					...textPropsObj,
					keyScale: createValue(textPropsObj.keyScale),
					max: drc.values.value('max'),
					min: drc.values.value('min'),
				}),
				parser: parseNumber,
				value: value,
				viewProps: args.viewProps,
			});
		}

		return new NumberTextController(args.document, {
			parser: parseNumber,
			props: ValueMap.fromObject(textPropsObj),
			value: value,
			viewProps: args.viewProps,
		});
	},
	api(args) {
		if (typeof args.controller.value.rawValue !== 'number') {
			return null;
		}

		if (args.controller.valueController instanceof SliderTextController) {
			return new SliderInputBindingApi(
				args.controller as InputBindingController<number, SliderTextController>,
			);
		}
		if (args.controller.valueController instanceof ListController) {
			return new ListInputBindingApi(
				args.controller as InputBindingController<
					number,
					ListController<number>
				>,
			);
		}

		return null;
	},
};
