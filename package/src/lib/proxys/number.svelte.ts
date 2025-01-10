import * as Y from 'yjs';
import type { NumberValidator } from '../schemas/number.js';
import { BaseSyncedType } from './base.svelte.js';
import type { SyncedContainer } from './common.js';
import { logError } from '../utils.js';
import type { State } from './syncroState.svelte.js';
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

	constructor(opts: {
		yType: Y.Text;
		validator: NumberValidator;
		parent: SyncedContainer;
		key: string | number;
		state: State;
	}) {
		super(opts);
		this.validator = opts.validator;
	}
}
