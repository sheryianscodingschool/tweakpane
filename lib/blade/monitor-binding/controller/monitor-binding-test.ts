import * as assert from 'assert';
import {describe, it} from 'mocha';

import {MonitorBinding} from '../../../common/binding/monitor';
import {BindingTarget} from '../../../common/binding/target';
import {ManualTicker} from '../../../common/binding/ticker/manual';
import {createNumberFormatter} from '../../../common/converter/number';
import {numberFromUnknown} from '../../../common/converter/number';
import {ValueMap} from '../../../common/model/value-map';
import {createValue} from '../../../common/model/values';
import {createViewProps} from '../../../common/model/view-props';
import {TestUtil} from '../../../misc/test-util';
import {SingleLogMonitorController} from '../../../monitor-binding/common/controller/single-log';
import {createBlade} from '../../common/model/blade';
import {LabelPropsObject} from '../../label/view/label';
import {MonitorBindingController} from './monitor-binding';

function create(): MonitorBindingController<number> {
	const obj = {
		foo: 123,
	};
	const doc = TestUtil.createWindow().document;
	const value = createValue(Array(10).fill(undefined));
	const binding = new MonitorBinding({
		reader: numberFromUnknown,
		target: new BindingTarget(obj, 'foo'),
		ticker: new ManualTicker(),
		value: value,
	});
	const controller = new SingleLogMonitorController(doc, {
		formatter: createNumberFormatter(0),
		value: value,
		viewProps: createViewProps(),
	});
	return new MonitorBindingController(doc, {
		binding: binding,
		blade: createBlade(),
		props: ValueMap.fromObject({
			label: 'foo',
		} as LabelPropsObject),
		valueController: controller,
	});
}

describe(MonitorBindingController.name, () => {
	it('should disable ticker', () => {
		const bc = create();
		assert.strictEqual(bc.binding.ticker.disabled, false);
		bc.viewProps.set('disabled', true);
		assert.strictEqual(bc.binding.ticker.disabled, true);
	});
});
