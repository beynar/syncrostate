import * as Y from 'yjs';
import type { EnumValidator } from '$lib/schemas/enum.js';

export class SyncedEnum<T extends string | number> {
	INTERNAL_ID = crypto.randomUUID();
	yType: Y.Text;
	validator: EnumValidator<T, false, false>;
	rawValue = $state<string>('');

	get value() {
		return this.validator.coerce(this.rawValue);
	}

	set value(value: T | null) {
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

	constructor(yType: Y.Text, validator: EnumValidator<T>) {
		this.yType = yType;
		this.validator = validator;
		this.rawValue = yType.toString();
		this.yType.observe(this.observe);
	}
}
