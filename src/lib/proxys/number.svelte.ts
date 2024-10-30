import type { Primitive } from '$lib/types.js';
import * as Y from 'yjs';
import { SvelteDate } from 'svelte/reactivity';
const toNumber = (value: any) => {
	const n = Number(value);
	if (Number.isNaN(n)) {
		return null;
	}
	return n;
};
const INTERNAL = 'INTERNAL';
export class SyncedNumber {
	yType: Y.Text;
	rawValue = $state<number | null>(null);
	get value() {
		return this.rawValue;
	}
	set value(value: number | null) {
		this.rawValue = toNumber(value);
		this.yType.doc?.transact(() => {
			this.yType.applyDelta(
				length ? [{ delete: length }, { insert: String(value) }] : [{ insert: String(value) }]
			);
		}, INTERNAL);
	}

	constructor(yType: Y.Text, schema: Primitive) {
		this.yType = yType;
		this.rawValue = toNumber(yType.toString());
		this.yType.observe((e, transact) => {
			if (transact.origin !== INTERNAL) {
				this.rawValue = toNumber(e.target.toString());
			}
		});
	}
}
