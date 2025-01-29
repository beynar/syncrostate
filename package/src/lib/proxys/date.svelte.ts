import * as Y from 'yjs';
import type { DateValidator } from '../schemas/date.js';
import { SvelteDate } from 'svelte/reactivity';
import { NULL } from '../constants.js';
import { BaseSyncedType } from './base.svelte.js';
import type { SyncedContainer } from './common.js';
import { logError, type Type } from '../utils.js';
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

const toDateSafe = (value: string | null) => {
	if (!value) {
		return null;
	}
	return new Date(value);
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
		if (this.validator) {
			const value = this.rawValue === NULL || !this.rawValue ? null : this.date;
			if (!this.validator.$schema.nullable && value === null) {
				return this.date;
			}
			if (!this.validator.$schema.optional && value === undefined) {
				return this.date;
			}
			return value;
		} else {
			return this.rawValue === NULL ? null : this.date;
		}
	}

	set value(value: Date | null | string | number) {
		if (this.validator) {
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
		} else {
			this.setSchemaLessValue(value);
		}
	}

	setValue = (string: string | null) => {
		if (this.validator) {
			const { isValid, value } = this.validator.parse(string);
			if (isValid) {
				this.date.setTime(value?.getTime() || 0);
			}
		} else {
			console.log('herelekazlekza lezal klzakelzak', { string });
			const date = toDateSafe(string);
			console.log({ date });
			if (date) {
				console.log('herelekazlekza lezal klzakelzak');
				this.date.setTime(date.getTime());
			}
		}
	};

	observeCallback = () => {
		this.setValue(this.rawValue);
	};

	constructor(opts: {
		yType: Y.Text;
		validator: DateValidator;
		parent: SyncedContainer;
		key: string | number;
		state: State;
		type?: Type;
	}) {
		super(opts);
		console.log(5, { rawValue: this.rawValue });
		this.validator = opts.validator;
		this.setValue(this.rawValue);
	}
}
