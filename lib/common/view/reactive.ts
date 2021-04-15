import {Value, ValueEvents} from '../model/value';
import {ValueMap} from '../model/value-map';
import {ViewProps} from '../model/view-props';
import {ClassName} from './class-name';

function compose<A, B, C>(
	h1: (input: A) => B,
	h2: (input: B) => C,
): (input: A) => C {
	return (input) => h2(h1(input));
}

function extractValue<T>(ev: ValueEvents<T>['change']): T {
	return ev.rawValue;
}

function applyClass(elem: HTMLElement, className: string, active: boolean) {
	if (active) {
		elem.classList.add(className);
	} else {
		elem.classList.remove(className);
	}
}

export function valueToClassName(
	elem: HTMLElement,
	className: string,
): (value: boolean) => void {
	return (value) => {
		applyClass(elem, className, value);
	};
}

const className = ClassName('');
function valueToModifier(
	elem: HTMLElement,
	modifier: string,
): (value: boolean) => void {
	return valueToClassName(elem, className(undefined, modifier));
}

export function bindValue<T>(value: Value<T>, applyValue: (value: T) => void) {
	value.emitter.on('change', compose(extractValue, applyValue));
	applyValue(value.rawValue);
}

export function bindValueMap<
	O extends Record<string, unknown>,
	Key extends keyof O
>(valueMap: ValueMap<O>, key: Key, applyValue: (value: O[Key]) => void) {
	bindValue(valueMap.value(key), applyValue);
}

export function bindClassModifier(viewProps: ViewProps, elem: HTMLElement) {
	bindValueMap(viewProps, 'disabled', valueToModifier(elem, 'disabled'));
	bindValueMap(viewProps, 'hidden', valueToModifier(elem, 'hidden'));
}

interface Disableable {
	disabled: boolean;
}

export function bindDisabled(viewProps: ViewProps, target: Disableable) {
	bindValueMap(viewProps, 'disabled', (disabled: boolean) => {
		target.disabled = disabled;
	});
}

export function bindTabIndex(viewProps: ViewProps, elem: HTMLOrSVGElement) {
	bindValueMap(viewProps, 'disabled', (disabled: boolean) => {
		elem.tabIndex = disabled ? -1 : 0;
	});
}

export function bindTextContent<
	Key extends string,
	O extends {
		[key in Key]: string | undefined;
	}
>(valueMap: ValueMap<O>, key: Key, elem: HTMLElement) {
	bindValueMap(valueMap, key, (text: string | undefined) => {
		elem.textContent = text ?? '';
	});
}