import * as Y from 'yjs';
import type { NumberValidator } from '$lib/schemas/number.js';

export class SyncedNumber {
	INTERNAL_ID = crypto.randomUUID();
	yType: Y.Text;
	validator: NumberValidator;
	rawValue = $state<string>('');

	get value() {
		return this.validator.coerce(this.rawValue);
	}

	set value(value: number | null) {
		if (value === null && !this.validator.$schema.nullable) {
			return;
		}
		const length = this.rawValue.length;
		this.rawValue = this.validator.stringify(value);
		this.yType.doc?.transact(() => {
			this.yType.applyDelta(
				length ? [{ delete: length }, { insert: this.rawValue }] : [{ insert: this.rawValue }]
			);
		}, this.INTERNAL_ID);
	}

	observe = (e: Y.YEvent<Y.Text>, transact: Y.Transaction) => {
		if (transact.origin !== this.INTERNAL_ID) {
			this.rawValue = e.target.toString();
		}
	};

	destroy = () => {
		this.yType.unobserve(this.observe);
	};
	constructor(yType: Y.Text, validator: NumberValidator) {
		this.yType = yType;
		this.validator = validator;
		this.rawValue = yType.toString();
		this.yType.observe(this.observe);
		this.yType.observe((e, transact) => {});
	}
}
