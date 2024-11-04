import * as Y from 'yjs';
import type { DateValidator } from '$lib/schemas/date.js';
import { SvelteDate } from 'svelte/reactivity';
import { NULL } from '$lib/constants.js';
import { BaseSyncedType } from './base.svelte.js';

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
		return this.rawValue === NULL || !this.rawValue ? null : this.date;
	}

	set value(value: Date | null) {
		if (value === null && !this.validator.$schema.nullable) {
			return;
		}
		const isValid = this.validator.validate(value);
		if (isValid) {
			this.setYValue(isValid.toISOString());
			this.date.setTime(isValid.getTime());
		} else {
			this.setYValue(null);
			this.date.setTime(0);
		}
	}

	observeCallback = () => {
		const isValid = this.validator.validate(this.rawValue);
		if ((!this.date && isValid) || (isValid && this.rawValue !== this.date?.toISOString())) {
			this.date.setTime(isValid.getTime());
		}
	};

	constructor(yType: Y.Text, validator: DateValidator) {
		super(yType);
		this.validator = validator;
		this.date.setTime(this.validator.validate(this.rawValue)?.getTime() || 0);
	}
}
