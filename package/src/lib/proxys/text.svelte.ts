import type { StringValidator } from '../schemas/string.js';
import * as Y from 'yjs';
import { BaseSyncedType } from './base.svelte.js';
import { NULL } from '../constants.js';

export class SyncedText extends BaseSyncedType {
	validator: StringValidator;

	get value() {
		return this.rawValue === NULL ? null : this.rawValue;
	}
	set value(value: string | null) {
		console.log(this.validator.isValid(value));
		if (!this.validator.isValid(value)) {
			console.error('Invalid value', { value });
			return;
		}
		this.setYValue(value);
	}

	constructor(yType: Y.Text, validator: StringValidator) {
		super(yType);
		this.validator = validator;
	}
}
