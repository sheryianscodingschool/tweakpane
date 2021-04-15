import {ValueMap} from '../../common/model/value-map';
import {findStringParam} from '../../common/params';
import {BladeParams} from '../common/api/types';
import {LabelController} from '../label/controller/label';
import {BladePlugin} from '../plugin';
import {ButtonApi} from './api/button';
import {ButtonController} from './controller/button';

export interface ButtonBladeParams extends BladeParams {
	title: string;
	view: 'button';

	label?: string;
}

export const ButtonBladePlugin: BladePlugin<ButtonBladeParams> = {
	id: 'button',
	accept(params) {
		if (findStringParam(params, 'view') !== 'button') {
			return null;
		}

		const title = findStringParam(params, 'title');
		if (title === undefined) {
			return null;
		}
		return {
			params: {
				label: findStringParam(params, 'label'),
				title: title,
				view: 'button',
			},
		};
	},
	controller(args) {
		return new LabelController(args.document, {
			blade: args.blade,
			props: new ValueMap({
				label: args.params.label,
			}),
			valueController: new ButtonController(args.document, {
				props: new ValueMap({
					title: args.params.title,
				}),
				viewProps: args.viewProps,
			}),
		});
	},
	api(controller) {
		if (!(controller instanceof LabelController)) {
			return null;
		}
		if (!(controller.valueController instanceof ButtonController)) {
			return null;
		}
		return new ButtonApi(controller);
	},
};