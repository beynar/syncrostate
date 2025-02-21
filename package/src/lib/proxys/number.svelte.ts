import * as Y from 'yjs';
import type { NumberValidator } from '../schemas/number.js';
import { BaseSyncedType } from './base.svelte.js';
import type { SyncedContainer } from './common.js';
import { logError, type Type } from '../utils.js';
import type { State } from './syncroState.svelte.js';
export class SyncedNumber extends BaseSyncedType {
	validator: NumberValidator;

	get value() {
		if (this.validator) {
			return this.validator.coerce(this.rawValue);
		} else {
			return Number(this.rawValue);
		}
	}

	set value(value: number | null) {
		if (this.validator) {
			if (!this.validator.isValid(value)) {
				logError('Invalid value', { value });
				return;
			}
			if (value === undefined) {
				this.deletePropertyFromParent();
			} else {
				this.setYValue(this.validator.stringify(value));
			}
		} else {
			console.log({ value });
			this.setSchemaLessValue(value);
		}
	}

	constructor(opts: {
		yType: Y.Text;
		validator: NumberValidator;
		parent: SyncedContainer;
		key: string | number;
		state: State;
		type?: Type;
	}) {
		super(opts);
		this.validator = opts.validator;
	}
}
