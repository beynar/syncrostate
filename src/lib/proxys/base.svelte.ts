import * as Y from 'yjs';
import { NULL } from '$lib/constants.js';

type ObserverCallback = (e: Y.YEvent<Y.Text>, transact: Y.Transaction) => void;

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
			console.log('observe', this.yType.toString());
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
