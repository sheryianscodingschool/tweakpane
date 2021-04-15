import * as assert from 'assert';
import {describe, it} from 'mocha';

import {Value} from '../../../common/model/value';
import {ValueMap} from '../../../common/model/value-map';
import {createViewProps} from '../../../common/model/view-props';
import {Color} from '../../../input-binding/color/model/color';
import {TestUtil} from '../../../misc/test-util';
import {forceCast} from '../../../misc/type-util';
import {testBladeContainer} from '../../common/api/blade-rack-test';
import {assertUpdates} from '../../common/api/test-util';
import {TpChangeEvent, TpFoldEvent} from '../../common/api/tp-event';
import {Blade} from '../../common/model/blade';
import {InputBindingApi} from '../../input-binding/api/input-binding';
import {FolderController} from '../controller/folder';
import {FolderApi} from './folder';

function createApi(opt_doc?: Document): FolderApi {
	const doc = opt_doc ?? TestUtil.createWindow().document;
	const c = new FolderController(doc, {
		blade: new Blade(),
		props: new ValueMap({
			title: 'Folder' as string | undefined,
		}),
		viewProps: createViewProps(),
	});
	return new FolderApi(c);
}

describe(FolderApi.name, () => {
	testBladeContainer(createApi);

	it('should have initial state', () => {
		const api = createApi();
		assert.strictEqual(api.expanded, true);
		assert.strictEqual(api.controller_.folder.expanded, true);
		assert.strictEqual(api.hidden, false);
		assert.strictEqual(api.title, 'Folder');
	});

	it('should update properties', () => {
		const api = createApi();

		assertUpdates(api);

		api.expanded = true;
		assert.strictEqual(api.controller_.folder.expanded, true);

		api.title = 'changed';
		assert.strictEqual(
			api.controller_.view.titleElement.textContent,
			'changed',
		);
	});

	it('should dispose', () => {
		const api = createApi();
		api.dispose();
		assert.strictEqual(api.controller_.blade.disposed, true);
	});

	it('should toggle expanded when clicking title element', () => {
		const api = createApi();

		api.controller_.view.buttonElement.click();
		assert.strictEqual(api.controller_.folder.expanded, false);
	});

	it('should dispose separator', () => {
		const api = createApi();
		const cs = api.controller_.rackController.rack.children;

		const s = api.addSeparator();
		assert.strictEqual(cs.length, 1);
		s.dispose();
		assert.strictEqual(cs.length, 0);
	});

	it('should add folder', () => {
		const pane = createApi();
		const f = pane.addFolder({
			title: 'folder',
		});
		assert.strictEqual(f.controller_.props.get('title'), 'folder');
		assert.strictEqual(f.controller_.folder.expanded, true);
	});

	it('should add collapsed folder', () => {
		const pane = createApi();
		const f = pane.addFolder({
			expanded: false,
			title: 'folder',
		});
		assert.strictEqual(f.controller_.folder.expanded, false);
	});

	it('should handle fold event', (done) => {
		const api = createApi();
		api.on('fold', (ev) => {
			assert.strictEqual(ev instanceof TpFoldEvent, true);
			assert.strictEqual(ev.expanded, false);
			done();
		});
		api.controller_.folder.expanded = false;
	});

	it('should handle global input events', (done) => {
		const api = createApi();
		const obj = {foo: 1};
		const bapi = api.addInput(obj, 'foo');

		api.on('change', (ev) => {
			assert.strictEqual(ev instanceof TpChangeEvent, true);
			assert.strictEqual(ev.presetKey, 'foo');
			assert.strictEqual(ev.value, 2);

			if (!(ev.target instanceof InputBindingApi)) {
				assert.fail('unexpected target');
			}
			assert.strictEqual(ev.target.controller_, bapi.controller_);

			done();
		});

		const value: Value<number> = forceCast(bapi.controller_.binding.value);
		value.rawValue += 1;
	});

	it('should handle global input events (nested)', (done) => {
		const api = createApi();
		const obj = {foo: 1};
		const fapi = api.addFolder({
			title: 'foo',
		});
		const bapi = fapi.addInput(obj, 'foo');

		api.on('change', (ev) => {
			assert.strictEqual(ev instanceof TpChangeEvent, true);
			assert.strictEqual(ev.presetKey, 'foo');
			assert.strictEqual(ev.value, 2);

			if (!(ev.target instanceof InputBindingApi)) {
				assert.fail('unexpected target');
			}
			assert.strictEqual(ev.target.controller_, bapi.controller_);

			done();
		});

		const value: Value<number> = forceCast(bapi.controller_.binding.value);
		value.rawValue += 1;
	});

	it('should bind `this` within handler to pane', (done) => {
		const PARAMS = {foo: 1};
		const pane = createApi();
		pane.on('change', function(this: any) {
			assert.strictEqual(this, pane);
			done();
		});

		const bapi = pane.addInput(PARAMS, 'foo');
		bapi.controller_.binding.value.rawValue = 2;
	});

	it('should dispose items', () => {
		const PARAMS = {foo: 1};
		const api = createApi();
		const i = api.addInput(PARAMS, 'foo');
		const m = api.addMonitor(PARAMS, 'foo');

		api.dispose();
		assert.strictEqual(api.controller_.blade.disposed, true);
		assert.strictEqual(i.controller_.blade.disposed, true);
		assert.strictEqual(m.controller_.blade.disposed, true);
	});

	it('should dispose items (nested)', () => {
		const PARAMS = {foo: 1};
		const api = createApi();
		const f = api.addFolder({title: ''});
		const i = f.addInput(PARAMS, 'foo');
		const m = f.addMonitor(PARAMS, 'foo');

		assert.strictEqual(api.controller_.blade.disposed, false);
		assert.strictEqual(i.controller_.blade.disposed, false);
		assert.strictEqual(m.controller_.blade.disposed, false);
		api.dispose();
		assert.strictEqual(api.controller_.blade.disposed, true);
		assert.strictEqual(i.controller_.blade.disposed, true);
		assert.strictEqual(m.controller_.blade.disposed, true);
	});

	it('should bind `this` within handler to folder', (done) => {
		const PARAMS = {foo: 1};
		const api = createApi();
		api.on('change', function(this: any) {
			assert.strictEqual(this, api);
			done();
		});

		const bapi = api.addInput(PARAMS, 'foo');
		bapi.controller_.binding.value.rawValue = 2;
	});

	it('should have right target', (done) => {
		const api = createApi();
		api.on('fold', (ev) => {
			assert.strictEqual(ev.target, api);
			done();
		});
		api.controller_.folder.expanded = !api.controller_.folder.expanded;
	});

	[
		{
			expected: 456,
			params: {
				propertyValue: 123,
				newInternalValue: 456,
			},
		},
		{
			expected: 'changed',
			params: {
				propertyValue: 'text',
				newInternalValue: 'changed',
			},
		},
		{
			expected: true,
			params: {
				propertyValue: false,
				newInternalValue: true,
			},
		},
		{
			expected: '#224488',
			params: {
				propertyValue: '#123',
				newInternalValue: new Color([0x22, 0x44, 0x88], 'rgb'),
			},
		},
		{
			expected: 'rgb(0, 127, 255)',
			params: {
				propertyValue: 'rgb(10, 20, 30)',
				newInternalValue: new Color([0, 127, 255], 'rgb'),
			},
		},
	].forEach(({expected, params}) => {
		context(`when ${JSON.stringify(params)}`, () => {
			it('should pass event for change event (local)', (done) => {
				const api = createApi();
				const obj = {foo: params.propertyValue};
				const bapi = api.addInput(obj, 'foo');

				bapi.on('change', (ev) => {
					assert.strictEqual(ev instanceof TpChangeEvent, true);
					assert.strictEqual(ev.target, bapi);
					assert.strictEqual(ev.presetKey, 'foo');
					assert.strictEqual(ev.value, expected);
					done();
				});
				bapi.controller_.binding.value.rawValue = params.newInternalValue;
			});

			it('should pass event for change event (global)', (done) => {
				const api = createApi();
				const obj = {foo: params.propertyValue};
				const bapi = api.addInput(obj, 'foo');

				api.on('change', (ev) => {
					assert.strictEqual(ev instanceof TpChangeEvent, true);
					assert.strictEqual(ev.presetKey, 'foo');
					assert.strictEqual(ev.value, expected);

					if (!(ev.target instanceof InputBindingApi)) {
						assert.fail('unexpected target');
					}
					assert.strictEqual(ev.target.controller_, bapi.controller_);

					done();
				});
				bapi.controller_.binding.value.rawValue = params.newInternalValue;
			});
		});
	});

	it('should not handle removed child events', () => {
		const api = createApi();

		let count = 0;
		api.on('change', () => {
			count += 1;
		});

		const item = api.addInput({foo: 0}, 'foo');
		(item.controller_.binding.value as Value<number>).rawValue += 1;
		api.remove(item);
		(item.controller_.binding.value as Value<number>).rawValue += 1;
		assert.strictEqual(count, 1);
	});
});