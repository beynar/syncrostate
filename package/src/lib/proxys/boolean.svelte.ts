import type { BooleanValidator } from '../schemas/boolean.js';
import { BaseSyncedType } from './base.svelte.js';
import * as Y from 'yjs';
import type { SyncedContainer } from './common.js';
import { logError, type Type } from '../utils.js';
import type { State } from './syncroState.svelte.js';
import { NULL } from '$lib/constants.js';

// 🚨🚨🚨 design decision: boolean are defaulted to false if not optionnal or nullable and the value does not exist in the document.

export class SyncedBoolean extends BaseSyncedType {
	validator: BooleanValidator;

	get value() {
		if (this.validator) {
			const value = this.validator.coerce(this.rawValue);
			if (!this.validator.$schema.nullable && value === null) {
				return this.validator.$schema.default || false;
			}
			if (!this.validator.$schema.optional && value === undefined) {
				return this.validator.$schema.default || false;
			}
			return value;
		} else {
			return this.rawValue === NULL ? null : this.rawValue === 'false' ? false : true;
		}
	}

	set value(value: boolean | null) {
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
			this.setSchemaLessValue(value);
		}
	}

	constructor(opts: {
		yType: Y.Text;
		validator: BooleanValidator;
		parent: SyncedContainer;
		key: string | number;
		state: State;
		type?: Type;
	}) {
		super(opts);
		this.validator = opts.validator;
	}
}
