import * as Y from 'yjs';
import type { NumberValidator } from '$lib/schemas/number.js';
import { BaseSyncedType } from './base.svelte.js';

export class SyncedNumber extends BaseSyncedType {
	validator: NumberValidator;

	get value() {
		return this.validator.coerce(this.rawValue);
	}

	set value(value: number | null) {
		if (value === null && !this.validator.$schema.nullable) {
			return;
		}
		this.setYValue(this.validator.stringify(value));
	}

	constructor(yType: Y.Text, validator: NumberValidator) {
		super(yType);
		this.validator = validator;
	}
}
