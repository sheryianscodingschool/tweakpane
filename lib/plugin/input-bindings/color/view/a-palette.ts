import {colorToFunctionalRgbaString} from '../../../common/converter/color';
import {Color} from '../../../common/model/color';
import {Value} from '../../../common/model/value';
import {mapRange} from '../../../common/number-util';
import {ClassName} from '../../../common/view/class-name';
import {ValueView} from '../../../common/view/value';

const className = ClassName('apl');

interface Config {
	value: Value<Color>;
}

/**
 * @hidden
 */
export class APaletteView implements ValueView<Color> {
	public readonly element: HTMLElement;
	public readonly value: Value<Color>;
	private colorElem_: HTMLDivElement;
	private markerElem_: HTMLDivElement;
	private previewElem_: HTMLDivElement;

	constructor(doc: Document, config: Config) {
		this.onValueChange_ = this.onValueChange_.bind(this);

		this.value = config.value;
		this.value.emitter.on('change', this.onValueChange_);

		this.element = doc.createElement('div');
		this.element.classList.add(className());
		this.element.tabIndex = 0;

		const barElem = doc.createElement('div');
		barElem.classList.add(className('b'));
		this.element.appendChild(barElem);

		const colorElem = doc.createElement('div');
		colorElem.classList.add(className('c'));
		barElem.appendChild(colorElem);
		this.colorElem_ = colorElem;

		const markerElem = doc.createElement('div');
		markerElem.classList.add(className('m'));
		this.element.appendChild(markerElem);
		this.markerElem_ = markerElem;

		const previewElem = doc.createElement('div');
		previewElem.classList.add(className('p'));
		this.markerElem_.appendChild(previewElem);
		this.previewElem_ = previewElem;

		this.update();
	}

	public update(): void {
		const c = this.value.rawValue;
		const rgbaComps = c.getComponents('rgb');
		const leftColor = new Color(
			[rgbaComps[0], rgbaComps[1], rgbaComps[2], 0],
			'rgb',
		);
		const rightColor = new Color(
			[rgbaComps[0], rgbaComps[1], rgbaComps[2], 255],
			'rgb',
		);
		const gradientComps = [
			'to right',
			colorToFunctionalRgbaString(leftColor),
			colorToFunctionalRgbaString(rightColor),
		];
		this.colorElem_.style.background = `linear-gradient(${gradientComps.join(
			',',
		)})`;

		this.previewElem_.style.backgroundColor = colorToFunctionalRgbaString(c);
		const left = mapRange(rgbaComps[3], 0, 1, 0, 100);
		this.markerElem_.style.left = `${left}%`;
	}

	private onValueChange_(): void {
		this.update();
	}
}
