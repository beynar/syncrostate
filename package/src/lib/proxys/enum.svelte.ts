import * as Y from 'yjs';
import type { EnumValidator } from '../schemas/enum.js';
import { BaseSyncedType } from './base.svelte.js';

export class SyncedEnum<T extends string | number = string | number> extends BaseSyncedType {
	validator: EnumValidator<T, false, false>;

	get value() {
		return this.validator.coerce(this.rawValue);
	}

	set value(value: T | null) {
		if (!this.validator.isValid(value)) {
			console.error('Invalid value', { value });
			return;
		}
		this.setYValue(this.validator.stringify(value));
	}

	constructor(yType: Y.Text, validator: EnumValidator<T>) {
		super(yType);
		this.validator = validator;
	}
}
