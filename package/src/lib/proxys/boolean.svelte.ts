import type { BooleanValidator } from '../schemas/boolean.js';
import { BaseSyncedType } from './base.svelte.js';
import * as Y from 'yjs';
import type { SyncedContainer } from './common.js';
import { logError } from '../utils.js';
import type { State } from './syncroState.svelte.js';

// 🚨🚨🚨 design decision: boolean are defaulted to false if not optionnal or nullable and the value does not exist in the document.

export class SyncedBoolean extends BaseSyncedType {
	validator: BooleanValidator;

	get value() {
		const value = this.validator.coerce(this.rawValue);
		if (!this.validator.$schema.nullable && value === null) {
			return this.validator.$schema.default || false;
		}
		if (!this.validator.$schema.optional && value === undefined) {
			return this.validator.$schema.default || false;
		}
		return value;
	}

	set value(value: boolean | null) {
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
		validator: BooleanValidator;
		parent: SyncedContainer;
		key: string | number;
		state: State;
	}) {
		super(opts);
		this.validator = opts.validator;
	}
}
