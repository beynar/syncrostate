import * as Y from 'yjs';
import type { DateValidator } from '$lib/schemas/date.js';
import { SvelteDate } from 'svelte/reactivity';
import { NULL } from '$lib/constants.js';
import { untrack } from 'svelte';

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

export class SyncedDate {
	INTERNAL_ID = crypto.randomUUID();
	yType: Y.Text;
	validator: DateValidator;
	rawValue = $state<string>('');
	// date = new SvelteDate();
	date = SvelteDateProxy(() => {
		const newRawValue = this.date.toISOString();
		const isNull = this.date.getTime() === 0;
		if (newRawValue !== this.rawValue && !isNull) {
			this.setYType(newRawValue);
		}
	});

	get value() {
		return this.rawValue === NULL || !this.rawValue ? null : this.date;
	}

	setYType(value: string) {
		const length = this.rawValue.length;
		this.rawValue = value;
		this.yType.doc?.transact(() => {
			this.yType.applyDelta(length ? [{ delete: length }, { insert: value }] : [{ insert: value }]);
		}, this.INTERNAL_ID);
	}

	set value(value: Date | null) {
		if (value === null && !this.validator.$schema.nullable) {
			return;
		}
		const isValid = this.validator.validate(value);
		if (isValid) {
			this.setYType(isValid.toISOString());
			this.date.setTime(isValid.getTime());
		} else {
			console.log('setting date to null');
			this.setYType(NULL);
			this.date.setTime(0);
		}
	}

	observe = (e: Y.YEvent<Y.Text>, transact: Y.Transaction) => {
		if (transact.origin !== this.INTERNAL_ID) {
			this.rawValue = e.target.toString();
			const isValid = this.validator.validate(this.rawValue);
			if ((!this.date && isValid) || (isValid && this.rawValue !== this.date?.toISOString())) {
				this.date.setTime(isValid.getTime());
			}
		}
	};

	destroy = () => {
		this.yType.unobserve(this.observe);
	};

	constructor(yType: Y.Text, validator: DateValidator) {
		this.yType = yType;
		this.validator = validator;
		this.rawValue = yType.toString();
		this.date.setTime(this.validator.validate(this.rawValue)?.getTime() || 0);
		this.yType.observe(this.observe);

		// Listen to date changes triggered by the user while using date methods
		// $effect(() => {
		// 	const newRawValue = this.date.toISOString();
		// 	const isNull = this.date.getTime() === 0;
		// 	untrack(() => {
		// 		if (newRawValue !== this.rawValue && !isNull) {
		// 			this.setYType(newRawValue);
		// 		}
		// 	});
		// });
	}
}
