import * as Y from 'yjs';
import { NULL } from '../constants.js';
import type { SyncedContainer } from './common.js';
import type { State } from './syncroState.svelte.js';
import { getStringifiedValueFromType, getTypeOfValue, type Type } from '../utils.js';

type ObserverCallback = (e: Y.YEvent<Y.Text>, transact: Y.Transaction) => void;

export class BaseSyncedType {
	yType: Y.Text;
	rawValue = $state<string | null>('');
	observeCallback?: ObserverCallback;
	state: State;
	parent: SyncedContainer;
	key: string | number;
	type = $state<Type | undefined>(undefined);
	constructor(opts: {
		yType: Y.Text;
		key: string | number;
		parent: SyncedContainer;
		state: State;
		type?: Type;
	}) {
		this.yType = opts.yType;
		this.rawValue = opts.yType.toString();
		this.yType.observe(this.observe);
		this.parent = opts.parent;
		this.key = opts.key;
		this.state = opts.state;
		this.type = opts.type;
	}

	deletePropertyFromParent = () => {
		this.parent.deleteProperty({}, this.key);
	};

	observe = (e: Y.YEvent<Y.Text>, transact: Y.Transaction) => {
		if (transact.origin !== this.state.transactionKey) {
			this.rawValue = this.yType.toString();
			const newType = this.yType.getAttribute('type');
			if (newType !== this.type) {
				this.type = newType;
			}
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
	setSchemaLessValue(value: any) {
		const length = this.yType.length;
		if (value == null) {
			// Set null on the type
			this.yType.applyDelta(length ? [{ delete: length }, { insert: NULL }] : [{ insert: NULL }]);
		} else if (value === undefined) {
			this.deletePropertyFromParent();
		} else {
			const type = getTypeOfValue(value);
			const stringifiedValue = getStringifiedValueFromType(value, type);
			const hasDifferentType = type !== this.type;
			console.log(0, {
				stringifiedValue,
				type,
				hasDifferentType
			});
			if (stringifiedValue) {
				this.rawValue = stringifiedValue;
				this.state.transaction(() => {
					if (hasDifferentType) {
						this.yType.setAttribute('type', type);
					}
					this.yType.applyDelta(
						length
							? [{ delete: length }, { insert: stringifiedValue ?? NULL }]
							: [{ insert: stringifiedValue ?? NULL }]
					);
				});
			}
			if (hasDifferentType) {
				this.parent.setChildType?.(this.key, type, shouldForceNewType(type, this.type!));
			}
		}
	}
}

const containerTypes = new Set(['array', 'set', 'map', 'object']);
const primitiveTypes = new Set(['string', 'number', 'boolean', 'date']);

const shouldForceNewType = (type: Type, previousType: Type) => {
	const newTypeIsPrimitive = primitiveTypes.has(type);
	const previousTypeIsPrimitive = primitiveTypes.has(previousType);
	const newTypeIsContainer = containerTypes.has(type);
	const previousTypeIsContainer = containerTypes.has(previousType);

	if (
		previousType === type ||
		(previousTypeIsPrimitive && newTypeIsPrimitive) ||
		(previousTypeIsContainer && newTypeIsContainer)
	) {
		return false;
	}

	if (newTypeIsPrimitive && previousTypeIsContainer) {
		return true;
	}
	if (previousTypeIsPrimitive && newTypeIsContainer) {
		return true;
	}

	return false;
};
