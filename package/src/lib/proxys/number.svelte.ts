import * as Y from 'yjs';
import type { NumberValidator } from '../schemas/number.js';
import { BaseSyncedType } from './base.svelte.js';
import type { SyncedObject } from './object.svelte.js';
import type { SyncedArray } from './array.svelte.js';
import { logError } from '../utils.js';
export class SyncedNumber extends BaseSyncedType {
	validator: NumberValidator;

	get value() {
		return this.validator.coerce(this.rawValue);
	}

	set value(value: number | null) {
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

	constructor(
		yType: Y.Text,
		validator: NumberValidator,
		parent: SyncedObject | SyncedArray,
		key: string | number
	) {
		super(yType, key, parent);
		this.validator = validator;
	}
}
