import * as Y from 'yjs';
import type { ArrayValidator } from '../schemas/array.js';
import { createSyncroState, type State, type SyncroStates } from './syncroState.svelte.js';
import type { SyncedContainer } from './common.js';

import { isArrayNull, logError, observeArray, propertyToNumber, setArrayToNull } from '../utils.js';
import { NULL_ARRAY } from '$lib/constants.js';

export class SyncedArray<T extends any = any> {
	state: State;
	validator: ArrayValidator<any>;
	yType: Y.Array<any>;
	parent: SyncedContainer;
	key: string | number;
	syncroStates = $state<SyncroStates[]>([]);
	proxy: any;
	isNull = $state(false);
	// array: any[] = $state(this.syncroStates.map((state) => state.value));

	//🚨 Using a derived would be preferable but it breaks the tests :/
	// private array = $derived(this.syncroStates.map((state) => state.value));

	private get array() {
		return this.syncroStates.map((state) => state.value);
	}
	setNull = () => {
		this.yType.delete(0, this.yType.length);
		this.yType.insert(0, [new Y.Text(NULL_ARRAY)]);
		this.isNull = true;
	};
	// setNull = setArrayToNull.bind(this);

	deleteProperty = (target: any, prop: any) => {
		const index = propertyToNumber(prop);
		if (typeof index !== 'number') {
			return true;
		}

		if (!this.validator.$schema.shape.$schema.optional) {
			logError('Can not delete non optional property', index);
			return true;
		}
		const syncroState = this.syncroStates[index];
		if (!syncroState) {
			logError('Index does not exist', index);
			return true;
		}
		syncroState.value = undefined;
		return true;
	};

	set value(input: any[] | null | undefined) {
		const { isValid, value } = this.validator.parse(input);
		if (!isValid) {
			logError('Invalid value', { value });
		} else {
			this.state.transaction(() => {
				if (!value) {
					if (value === undefined) {
						this.parent.deleteProperty({}, this.key);
					} else {
						this.setNull();
					}
				} else {
					if (this.isNull) {
						this.isNull = false;
						this.yType.delete(0, this.yType.length);
					}
					if (!this.isNull) {
						const remainingStates = this.syncroStates.slice(value.length);
						remainingStates.forEach((state) => {
							state.destroy();
						});
						if (remainingStates.length) {
							this.yType.delete(value.length, remainingStates.length);
						}
					}
					this.syncroStates = value.map((item, index) => {
						const previsousState = this.syncroStates[index];

						if (previsousState) {
							previsousState.value = item;
							return previsousState;
						} else {
							return createSyncroState({
								key: index,
								forceNewType: true,
								validator: this.validator.$schema.shape,
								parent: this,
								value: item,
								state: this.state
							});
						}
					});
				}
			});
		}
	}
	get value() {
		if (this.isNull) {
			return null;
		}
		return this.proxy;
	}

	constructor({
		validator,
		yType,
		value,
		parent,
		key,
		state
	}: {
		validator: ArrayValidator<any>;
		yType: Y.Array<any>;
		value: any[];
		parent: SyncedContainer;
		key: string | number;
		state: State;
	}) {
		this.validator = validator;
		this.yType = yType;
		this.parent = parent;
		this.key = key;
		this.state = state;
		yType.observe(this.observe);

		this.proxy = new Proxy([], {
			get: (target: any, prop: any, receiver: any) => {
				if (prop === 'getState') {
					return () => state;
				}
				if (prop === 'getYType') {
					return () => this.yType;
				}
				if (prop === 'getYTypes') {
					return () => this.yType.toArray();
				}
				const p = propertyToNumber(prop);
				if (Number.isInteger(p)) {
					const syncroState = this.syncroStates[p as number];
					if (!syncroState) {
						return undefined;
					}
					return syncroState.value;
				} else if (typeof p === 'string') {
					if (p in this.methods) {
						return this.methods[p as keyof typeof this.methods];
					}

					if (p[0] === '$') {
						return Reflect.get(target, p);
					}

					if (p === 'toJSON') {
						return this.toJSON();
					}

					if (p === 'length') {
						return this.array.length;
					}
				} else if (p === Symbol.toStringTag) {
					return 'Array';
				} else if (p === Symbol.iterator) {
					const values = this.array.slice();
					return Reflect.get(values, p);
				}
				return Reflect.get(target, p, receiver);
			},

			set: (target: any, prop: any, value: any) => {
				const p = propertyToNumber(prop);
				if (Number.isInteger(p)) {
					if (value === undefined) {
						return this.deleteProperty(target, p);
					}

					const syncroState = this.syncroStates[p as number];

					if (!syncroState) {
						this.state.transaction(() => {
							this.syncroStates[p as number] = createSyncroState({
								key: p as number,
								validator: this.validator.$schema.shape,
								parent: this,
								value,
								state: this.state
							});
						});
					} else {
						syncroState.value = value;
					}
				}
				return true;
			},
			deleteProperty: this.deleteProperty,
			has: (target, prop) => {
				const p = propertyToNumber(prop);
				if (typeof p !== 'number') {
					// forward to arrayimplementation
					return Reflect.has(target, p);
				}
				if (p < (this.array as any).lengthUntracked && p >= 0) {
					return true;
				} else {
					return false;
				}
			},

			getOwnPropertyDescriptor: (target, prop) => {
				const p = propertyToNumber(prop);
				if (p === 'length') {
					return {
						enumerable: false,
						configurable: false,
						writable: true
					};
				}
				if (typeof p === 'number' && p >= 0 && p < this.yType.length) {
					return {
						enumerable: true,
						configurable: true,
						writable: true
					};
				}
				return undefined;
			},
			ownKeys: (target) => {
				const keys: string[] = [];
				for (let i = 0; i < this.yType.length; i++) {
					keys.push(i + '');
				}
				keys.push('length');
				return keys;
			}
		});

		this.sync(value);
	}

	toJSON = () => {
		return this.array;
	};

	sync = (value?: any[]) => {
		this.state.transaction(() => {
			this.syncroStates = [];
			if (isArrayNull(this)) {
				this.isNull = true;
				return;
			}

			if (this.state.initialized || value) {
				for (let i = 0; i < Math.max(value?.length || 0, this.yType.length); i++) {
					this.syncroStates[i] = createSyncroState({
						key: i,
						validator: this.validator.$schema.shape,
						parent: this,
						value: value?.[i] || this.validator.$schema.default?.[i],
						state: this.state
					});
				}
			} else {
				if (this.validator.$schema.default) {
					this.syncroStates = this.validator.$schema.default.map((item, index) => {
						return createSyncroState({
							key: index,
							validator: this.validator.$schema.shape,
							parent: this,
							value: item,
							state: this.state
						});
					});
				} else if (this.validator.$schema.nullable && !value) {
					this.setNull();
				}
			}
		});
	};

	observe = observeArray.bind(this);

	methods = {
		slice: (start?: number | undefined, end?: number | undefined) => {
			return this.array.slice(start, end);
		},
		toReversed: () => {
			return this.array.toReversed();
		},
		forEach: (cb: (value: T, index: number, array: T[]) => void) => {
			return this.array.forEach(cb);
		},
		every: (cb: (value: T, index: number, array: T[]) => boolean) => {
			return this.array.every(cb);
		},
		filter: (cb: (value: T, index: number, array: T[]) => boolean) => {
			return this.array.filter(cb);
		},
		find: (cb: (value: T, index: number, array: T[]) => boolean) => {
			return this.array.find(cb);
		},
		findIndex: (cb: (value: T, index: number, array: T[]) => boolean) => {
			return this.array.findIndex(cb);
		},
		some: (cb: (value: T, index: number, array: T[]) => boolean) => {
			return this.array.some(cb);
		},
		includes: (value: T) => {
			return this.array.includes(value);
		},
		map: (cb: (value: T, index: number, array: T[]) => T) => {
			return this.array.map(cb);
		},
		reduce: <X>(
			cb: (acc: X | undefined, value: T, index: number, array: T[]) => X,
			initialValue?: X
		) => {
			return this.array.reduce(cb, initialValue);
		},
		indexOf: (value: T) => {
			return this.array.indexOf(value);
		},
		at: (index: number) => {
			return this.array.at(index)?.value;
		},
		//
		// Mutatives methods
		//

		pop: () => {
			if (!this.syncroStates.length) {
				return undefined;
			}
			const last = this.syncroStates.pop();
			this.state.transaction(() => {
				this.yType.delete(this.yType.length - 1, 1);
				last?.destroy();
			});
			return last?.value;
		},
		shift: () => {
			if (!this.syncroStates.length) {
				return undefined;
			}
			const first = this.syncroStates.shift();
			this.state.transaction(() => {
				this.yType.delete(0, 1);
				first?.destroy();
			});
			return first?.value;
		},
		unshift: (...items: T[]) => {
			let result;
			this.state.transaction(() => {
				result = this.syncroStates.unshift(
					...items.map((item, index) => {
						return createSyncroState({
							forceNewType: true,
							key: index,
							validator: this.validator.$schema.shape,
							parent: this,
							value: item,
							state: this.state
						});
					})
				);
			});
			return result;
		},
		push: (...items: T[]) => {
			this.state.transaction(() => {
				this.syncroStates.push(
					...items.map((item, index) => {
						return createSyncroState({
							key: this.yType.length,
							validator: this.validator.$schema.shape,
							parent: this,
							value: item,
							state: this.state
						});
					})
				);
			});
		},
		splice: (start: number, deleteCount: number, ..._items: T[]) => {
			let result: any[] = [];
			this.state.transaction(() => {
				// Normalize start index (handle negative values like native Array.splice)
				const actualStart = start < 0 ? Math.max(0, this.syncroStates.length + start) : Math.min(start, this.syncroStates.length);
				
				// Normalize deleteCount (don't delete more than available, treat negative as 0)
				const actualDeleteCount = Math.min(Math.max(0, deleteCount), this.syncroStates.length - actualStart);
				
				// Delete from Y.js document (only if there are items to delete and within bounds)
				if (actualDeleteCount > 0 && this.yType.length > actualStart) {
					const yDeleteCount = Math.min(actualDeleteCount, this.yType.length - actualStart);
					this.yType.delete(actualStart, yDeleteCount);
				}
				
				// Create new SyncroState objects for inserted items
				const newSyncroStates = _items.map((item, index) => {
					return createSyncroState({
						key: actualStart + index,
						forceNewType: true,
						validator: this.validator.$schema.shape,
						parent: this,
						value: item,
						state: this.state
					});
				});
				
				// Destroy old SyncroState objects for deleted items (with bounds checking)
				if (actualDeleteCount > 0) {
					for (let i = 0; i < actualDeleteCount; i++) {
						const state = this.syncroStates[actualStart + i];
						if (state) {
							state.destroy();
						}
					}
				}
				
				// Update the syncroStates array with normalized values
				result = this.syncroStates.splice(actualStart, actualDeleteCount, ...newSyncroStates);
			});

			return result;
		}
	};

	destroy = () => {
		this.syncroStates.forEach((state) => {
			state.destroy();
		});
		this.syncroStates = [];
		this.yType.unobserve(this.observe);
	};
}
