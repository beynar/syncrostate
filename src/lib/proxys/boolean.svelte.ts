import type { BooleanValidator } from '$lib/schemas/boolean.js';
import { BaseSyncedType } from './base.svelte.js';
import * as Y from 'yjs';

export class SyncedBoolean extends BaseSyncedType {
	validator: BooleanValidator;

	get value() {
		return this.validator.coerce(this.rawValue);
	}

	set value(value: boolean | null) {
		if (value === null && !this.validator.$schema.nullable) {
			return;
		}

		this.setYValue(this.validator.stringify(value));
	}

	constructor(yType: Y.Text, validator: BooleanValidator) {
		super(yType);
		this.validator = validator;
	}
}
