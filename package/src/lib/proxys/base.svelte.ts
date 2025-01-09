import * as Y from 'yjs';
import { NULL } from '../constants.js';
import type { SyncedArray } from './array.svelte.js';
import type { SyncedObject } from './object.svelte.js';
import type { State } from './syncroState.svelte.js';

type ObserverCallback = (e: Y.YEvent<Y.Text>, transact: Y.Transaction) => void;

export class BaseSyncedType {
	yType: Y.Text;
	rawValue = $state<string | null>('');
	observeCallback?: ObserverCallback;
	state: State;
	parent: SyncedObject | SyncedArray;
	key: string | number;
	constructor(opts: {
		yType: Y.Text;
		key: string | number;
		parent: SyncedObject | SyncedArray;
		state: State;
	}) {
		this.yType = opts.yType;
		this.rawValue = opts.yType.toString();
		this.yType.observe(this.observe);
		this.parent = opts.parent;
		this.key = opts.key;
		this.state = opts.state;
	}

	deletePropertyFromParent = () => {
		this.parent.deleteProperty({}, this.key);
	};

	observe = (e: Y.YEvent<Y.Text>, transact: Y.Transaction) => {
		if (transact.origin !== this.state.transactionKey) {
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
			this.state.transaction(() => {
				this.yType.applyDelta(
					length ? [{ delete: length }, { insert: value ?? NULL }] : [{ insert: value ?? NULL }]
				);
			});
		}
	}
}
