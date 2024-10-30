import type { Primitive } from '$lib/types.js';
import * as Y from 'yjs';

const INTERNAL = 'INTERNAL';
export class SyncedText {
	yType: Y.Text;
	rawValue = $state<string>('');
	get value() {
		return this.rawValue;
	}
	set value(value: string) {
		this.rawValue = value;
		console.log('set value', value);
		this.yType.doc?.transact(() => {
			const length = this.yType.length;
			this.yType.applyDelta(length ? [{ delete: length }, { insert: value }] : [{ insert: value }]);
		}, INTERNAL);
	}

	constructor(yType: Y.Text, schema: Primitive) {
		this.yType = yType;
		this.rawValue = yType.toString();
		this.yType.observe((e, transact) => {
			if (transact.origin !== INTERNAL) {
				console.log({ e, transact });
				this.rawValue = this.yType.toString();
			}
		});
	}
}
