import {MonitorBindingValue} from '../../../common/binding/value/monitor';
import {ValueController} from '../../../common/controller/value';
import {Formatter} from '../../../common/converter/formatter';
import {Buffer, BufferedValue} from '../../../common/model/buffered-value';
import {ViewProps} from '../../../common/model/view-props';
import {SingleLogView} from '../view/single-log';

interface Config<T> {
	formatter: Formatter<T>;
	value: MonitorBindingValue<T>;
	viewProps: ViewProps;
}

/**
 * @hidden
 */
export class SingleLogController<T>
	implements ValueController<Buffer<T>, SingleLogView<T>, BufferedValue<T>>
{
	public readonly value: BufferedValue<T>;
	public readonly view: SingleLogView<T>;
	public readonly viewProps: ViewProps;

	constructor(doc: Document, config: Config<T>) {
		this.value = config.value;
		this.viewProps = config.viewProps;

		this.view = new SingleLogView(doc, {
			formatter: config.formatter,
			value: this.value,
			viewProps: this.viewProps,
		});
	}
}
