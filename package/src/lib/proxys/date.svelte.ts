import * as Y from 'yjs';
import type { DateValidator } from '../schemas/date.js';
import { SvelteDate } from 'svelte/reactivity';
import { NULL } from '../constants.js';
import { BaseSyncedType } from './base.svelte.js';
import type { SyncedArray } from './array.svelte.js';
import type { SyncedObject } from './object.svelte.js';
import { logError } from '../utils.js';
import type { State } from './syncroState.svelte.js';
// 🚨🚨🚨 design decision: date are defaulted to new Date() if not optionnal or nullable and the value does not exist in the document.

const SvelteDateProxy = (onSet: () => void) => {
	const date = new SvelteDate();
	return new Proxy(date, {
		get(target, prop) {
			const result = Reflect.get(target, prop);
			if (typeof result === 'function') {
				return (...args: any[]) => {
					const ret = result.call(target, ...args);
					if (typeof prop === 'string' && prop.startsWith('set')) {
						onSet();
					}
					return ret;
				};
			} else {
				return result;
			}
		}
	});
};

export class SyncedDate extends BaseSyncedType {
	validator: DateValidator;

	date = SvelteDateProxy(() => {
		const newRawValue = this.date.toISOString();
		const isNull = this.date.getTime() === 0;
		if (newRawValue !== this.rawValue && !isNull) {
			this.setYValue(newRawValue);
		}
	});

	get value() {
		const value = this.rawValue === NULL || !this.rawValue ? null : this.date;
		if (!this.validator.$schema.nullable && value === null) {
			return this.date;
		}
		if (!this.validator.$schema.optional && value === undefined) {
			return this.date;
		}
		return value;
	}

	set value(value: Date | null | string | number) {
		const isValid = this.validator.isValid(value);
		if (!isValid) {
			logError('Invalid value', { value });
			return;
		}
		if (value !== null && value !== undefined) {
			this.setYValue(new Date(value).toISOString());
			this.date.setTime(new Date(value).getTime());
		} else {
			if (value === undefined) {
				this.deletePropertyFromParent();
			} else {
				this.setYValue(null);
				this.date.setTime(0);
			}
		}
	}

	setValue = (string: string | null) => {
		const { isValid, value } = this.validator.parse(string);
		if (isValid) {
			this.date.setTime(value?.getTime() || 0);
		}
	};

	observeCallback = () => {
		this.setValue(this.rawValue);
	};

	constructor(opts: {
		yType: Y.Text;
		validator: DateValidator;
		parent: SyncedObject | SyncedArray;
		key: string | number;
		state: State;
	}) {
		super(opts);
		this.validator = opts.validator;
		this.setValue(this.rawValue);
	}
}
