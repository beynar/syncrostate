import * as Y from 'yjs';
import { NULL } from '../constants.js';
import type { BaseValidator } from '$lib/schemas/base.js';
import type { Validator } from '$lib/schemas/schema.js';

type ObserverCallback = (e: Y.YEvent<Y.Text>, transact: Y.Transaction) => void;

export const getInitialStringifiedValue = (value: any, validator: Validator) => {
	if (validator.$schema.kind === 'array' || validator.$schema.kind === 'object') {
		return undefined;
	}
	const DEFAULT_VALUE = value === null ? null : (value ?? validator.$schema.default);

	const isValid = validator.isValid(DEFAULT_VALUE);
	if (!isValid) {
		return undefined;
	}
	if (DEFAULT_VALUE !== undefined) {
		const stringifiedDefaultValue = (validator as BaseValidator<any>).stringify(DEFAULT_VALUE);

		return stringifiedDefaultValue;
	}
};

export class BaseSyncedType {
	INTERNAL_ID: string;
	yType: Y.Text;
	rawValue = $state<string | null>('');
	observeCallback?: ObserverCallback;

	constructor(yType: Y.Text) {
		this.INTERNAL_ID = crypto.randomUUID();
		this.yType = yType;
		this.rawValue = yType.toString();
		this.yType.observe(this.observe);
	}

	observe = (e: Y.YEvent<Y.Text>, transact: Y.Transaction) => {
		if (transact.origin !== this.INTERNAL_ID) {
			this.rawValue = this.yType.toString();
			this.observeCallback?.(e, transact);
		}
	};

	destroy = () => {
		this.yType.unobserve(this.observe);
	};

	setYValue(value: string | null) {
		if (this.rawValue !== value) {
			const length = this.yType.length;
			this.rawValue = value;
			this.yType.doc?.transact(() => {
				this.yType.applyDelta(
					length ? [{ delete: length }, { insert: value ?? NULL }] : [{ insert: value ?? NULL }]
				);
			}, this.INTERNAL_ID);
		}
	}
	[Symbol.dispose]() {
		this.destroy();
	}
}
