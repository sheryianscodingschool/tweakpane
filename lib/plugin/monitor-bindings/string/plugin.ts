import {Constants} from '../../../misc/constants';
import {
	StringFormatter,
	stringFromUnknown,
} from '../../common/converter/string';
import {MonitorBindingPlugin} from '../../monitor-binding';
import {MultiLogController} from '../common/controller/multi-log';
import {SingleLogMonitorController} from '../common/controller/single-log';

/**
 * @hidden
 */
export const StringMonitorPlugin: MonitorBindingPlugin<string> = {
	id: 'monitor-string',
	binding: {
		accept: (value, _params) => (typeof value === 'string' ? value : null),
		reader: (_args) => stringFromUnknown,
	},
	controller: (args) => {
		const value = args.binding.value;
		const multiline =
			value.rawValue.length > 1 ||
			('multiline' in args.params && args.params.multiline);
		if (multiline) {
			return new MultiLogController(args.document, {
				formatter: new StringFormatter(),
				lineCount: args.params.lineCount ?? Constants.monitor.defaultLineCount,
				value: value,
			});
		}

		return new SingleLogMonitorController(args.document, {
			formatter: new StringFormatter(),
			value: value,
		});
	},
};
