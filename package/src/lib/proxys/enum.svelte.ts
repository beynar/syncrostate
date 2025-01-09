import * as Y from 'yjs';
import type { EnumValidator } from '../schemas/enum.js';
import { BaseSyncedType } from './base.svelte.js';
import type { SyncedObject } from './object.svelte.js';
import type { SyncedArray } from './array.svelte.js';
import { logError } from '../utils.js';
import type { State } from './syncroState.svelte.js';
// 🚨🚨🚨 design decision: enum are defaulted to the first value of the set if not optionnal or nullable and the value does not exist in the document.
export class SyncedEnum<T extends string | number = string | number> extends BaseSyncedType {
	validator: EnumValidator<T, false, false>;
	private firstValue: T;

	get value() {
		const value = this.validator.coerce(this.rawValue);
		if (!this.validator.$schema.nullable && value === null) {
			return this.validator.$schema.default || this.firstValue;
		}
		if (!this.validator.$schema.optional && value === undefined) {
			return this.validator.$schema.default || this.firstValue;
		}
		return value;
	}

	set value(value: T | null) {
		if (!this.validator.isValid(value)) {
			logError('Invalid value', { value });
			return;
		}
		if (value === undefined) {
			this.deletePropertyFromParent();
		} else {
			this.setYValue(this.validator.stringify(value));
		}
	}

	constructor(opts: {
		yType: Y.Text;
		validator: EnumValidator<T>;
		parent: SyncedObject | SyncedArray;
		key: string | number;
		state: State;
	}) {
		super(opts);
		this.firstValue = opts.validator.$schema.values.values().next().value;
		this.validator = opts.validator;
	}
}
