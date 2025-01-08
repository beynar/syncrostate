import * as Y from 'yjs';
import { NULL } from '../constants.js';
import type { SyncedArray } from './array.svelte.js';
import type { SyncedObject } from './object.svelte.js';

type ObserverCallback = (e: Y.YEvent<Y.Text>, transact: Y.Transaction) => void;

export class BaseSyncedType {
	INTERNAL_ID: string;
	yType: Y.Text;
	rawValue = $state<string | null>('');
	observeCallback?: ObserverCallback;

	constructor(
		yType: Y.Text,
		private key: string | number,
		private parent: SyncedObject | SyncedArray
	) {
		this.INTERNAL_ID = crypto.randomUUID();
		this.yType = yType;
		this.rawValue = yType.toString();
		this.yType.observe(this.observe);
	}

	deletePropertyFromParent = () => {
		this.parent.deleteProperty({}, this.key);
	};

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
}
