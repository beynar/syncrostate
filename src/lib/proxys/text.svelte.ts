import { NULL } from '$lib/constants.js';
import type { StringValidator } from '$lib/schemas/string.js';
import * as Y from 'yjs';

export class SyncedText {
	INTERNAL_ID = crypto.randomUUID();
	yType: Y.Text;
	rawValue = $state<string>('');
	validator: StringValidator;
	get value() {
		return this.rawValue === NULL ? null : this.rawValue;
	}
	set value(value: string | null) {
		if (value === null && !this.validator.$schema.nullable) {
			return;
		}
		this.rawValue = value ?? NULL;
		this.yType.doc?.transact(() => {
			const length = this.yType.length;
			this.yType.applyDelta(length ? [{ delete: length }, { insert: value }] : [{ insert: value }]);
		}, this.INTERNAL_ID);
	}

	observe = (e: Y.YEvent<Y.Text>, transact: Y.Transaction) => {
		if (transact.origin !== this.INTERNAL_ID) {
			this.rawValue = this.yType.toString();
		}
	};
	destroy = () => {
		this.yType.unobserve(this.observe);
	};
	constructor(yType: Y.Text, validator: StringValidator) {
		this.yType = yType;
		this.rawValue = yType.toString();
		this.yType.observe(this.observe);
		this.validator = validator;
	}
}
