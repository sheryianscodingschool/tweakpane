import {
	MicroParser,
	MicroParsers,
	parseRecord,
} from '../../../common/micro-parsers';

/**
 * A state object for blades.
 */
export type BladeState = Record<string, unknown>;

/**
 * A utility function for importing a blade state.
 * @param state The state object.
 * @param superImport The function to invoke super.import().
 * @param parser The state micro parser object.
 * @param callback The callback function that will be called when parsing is successful.
 * @return true if parsing is successful.
 */
export function importBladeState<O extends BladeState>(
	state: BladeState,
	superImport: (state: BladeState) => boolean,
	parser: (p: typeof MicroParsers) => {
		[key in keyof O]: MicroParser<O[key]>;
	},
	callback: (o: O) => boolean,
): boolean {
	if (!superImport(state)) {
		return false;
	}
	const result = parseRecord(state, parser);
	return result ? callback(result) : false;
}

/**
 * A utility function for exporting a blade state.
 * @param superExport The function to invoke super.export().
 * @param thisState The blade state from the current blade.
 * @return An exported object.
 */
export function exportBladeState(
	superExport: () => BladeState,
	thisState: BladeState,
): BladeState {
	return {
		...superExport(),
		...thisState,
	};
}

export interface BladeStatePortable {
	importState: (state: BladeState) => boolean;
	exportState: () => BladeState;
}
