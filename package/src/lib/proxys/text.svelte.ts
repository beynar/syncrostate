import type { StringValidator } from '../schemas/string.js';
import * as Y from 'yjs';
import { BaseSyncedType } from './base.svelte.js';
import { NULL } from '../constants.js';
import { logError, type Type } from '../utils.js';
import type { State } from './syncroState.svelte.js';
import type { SyncedContainer } from './common.js';

export class SyncedText extends BaseSyncedType {
	validator?: StringValidator;

	get value() {
		if (this.type) {
			return this.rawValue === NULL ? null : this.rawValue;
		} else {
			return this.rawValue === NULL ? null : this.rawValue;
		}
	}
	set value(value: string | null) {
		if (this.validator) {
			const isValid = this.validator.isValid(value);
			if (!isValid) {
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
		validator?: StringValidator;
		parent: SyncedContainer;
		key: string | number;
		state: State;
		type?: Type;
	}) {
		super(opts);
		this.validator = opts.validator;
	}
}
