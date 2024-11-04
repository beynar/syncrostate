import type { StringValidator } from '$lib/schemas/string.js';
import * as Y from 'yjs';
import { BaseSyncedType } from './base.svelte.js';
import { NULL } from '$lib/constants.js';

export class SyncedText extends BaseSyncedType {
	validator: StringValidator;

	get value() {
		return this.rawValue === NULL ? null : this.rawValue;
	}
	set value(value: string | null) {
		if (value === null && !this.validator.$schema.nullable) {
			return;
		}
		this.setYValue(value);
	}

	constructor(yType: Y.Text, validator: StringValidator) {
		super(yType);
		this.validator = validator;
	}
}
