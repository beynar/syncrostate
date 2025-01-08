import * as Y from 'yjs';
import type { ArrayValidator } from '../schemas/array.js';
import { createSyncroState, type SyncroStates } from './syncroState.svelte.js';
import type { SyncedObject } from './object.svelte.js';
import { logError } from '../utils.js';

function propertyToNumber(p: string | number | symbol) {
	if (typeof p === 'string' && p.trim().length) {
		const asNum = Number(p);
		// https://stackoverflow.com/questions/10834796/validate-that-a-string-is-a-positive-integer
		if (Number.isInteger(asNum)) {
			return asNum;
		}
	}
	return p;
}

export class SyncedArray<T extends any = any> {
	INTERNAL_ID = crypto.randomUUID();
	validator: ArrayValidator<any>;
	yType: Y.Array<any>;
	parent: SyncedObject | SyncedArray;
	key: string | number;
	syncroStates = $state<SyncroStates[]>([]);
	proxy: any;

	private get array() {
		return this.syncroStates.map((state) => state.value);
	}

	deleteProperty = (target: any, pArg: any) => {
		const p = propertyToNumber(pArg);
		if (typeof p !== 'number') {
			return true;
		}

		if (!this.validator.$schema.shape.$schema.optional) {
			logError('Can not delete non optional property', p);
			return true;
		}
		const syncroState = this.syncroStates[p];
		if (!syncroState) {
			logError('Index does not exist', p);
			return true;
		}
		syncroState.value = undefined;
		return true;
	};

	set value(input: any[]) {
		const { isValid, value } = this.validator.parse(input);
		if (!isValid) {
			logError('Invalid value', { value });
			return;
		}
		this.transact(() => {
			if (!value) {
				if (value === undefined) {
					this.parent.deleteProperty({}, this.key);
				} else {
					// TODO: handle when value is null
					// we should delete all states
					// but i do not know how to mark this value as null
					// in the yjs doc as it is not a YText;
				}
			} else {
				const remainingStates = this.syncroStates.slice(value.length);
				remainingStates.forEach((state) => {
					state.destroy();
				});
				if (remainingStates.length) {
					this.yType.delete(value.length, remainingStates.length);
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
							value: item
						});
					}
				});
			}
		});
	}
	get value() {
		this.syncroStates;
		return this.proxy;
	}

	constructor({
		validator,
		yType,
		value,
		parent,
		key
	}: {
		validator: ArrayValidator<any>;
		yType: Y.Array<any>;
		value: any[];
		parent: SyncedObject | SyncedArray;
		key: string | number;
	}) {
		this.validator = validator;
		this.yType = yType;
		this.parent = parent;
		this.key = key;
		yType.observe(this.observe);
		const shape = this.validator.$schema.shape;
		this.proxy = new Proxy([], {
			get: (target: any, pArg: any, receiver: any) => {
				const p = propertyToNumber(pArg);
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
			deleteProperty: this.deleteProperty,
			set: (target: any, pArg: any, value: any) => {
				const p = propertyToNumber(pArg);
				if (Number.isInteger(p)) {
					if (value === undefined) {
						return this.deleteProperty(target, p);
					}

					const syncroState = this.syncroStates[p as number];

					if (!syncroState) {
						this.transact(() => {
							this.syncroStates[p as number] = createSyncroState({
								key: p as number,
								validator: shape,
								parent: this,
								value
							});
						});
					} else {
						syncroState.value = value;
					}
				}
				return true;
			},
			getOwnPropertyDescriptor: (target, pArg) => {
				const p = propertyToNumber(pArg);
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
		this.sync(value || this.validator.$schema.default || []);
	}

	transact = (fn: () => void) => {
		this.yType.doc?.transact(() => {
			fn();
		}, this.INTERNAL_ID);
	};

	toJSON = () => {
		return this.array;
	};

	sync = (value?: any[]) => {
		this.syncroStates = [];
		this.yType.forEach((item, index) => {
			this.syncroStates[index] = createSyncroState({
				key: index,
				validator: this.validator.$schema.shape,
				parent: this,
				value: value?.[index]
			});
		});
	};

	observe = (e: Y.YArrayEvent<any>, _transaction: Y.Transaction) => {
		if (_transaction.origin === this.INTERNAL_ID) {
			return;
		}
		let start = 0;
		e.delta.forEach(({ retain, delete: _delete, insert }) => {
			if (retain) {
				start += retain;
			}
			if (_delete) {
				const deleted = this.syncroStates.splice(start, _delete);
				deleted.forEach((state) => {
					state.destroy();
				});
				start -= _delete;
			}
			if (Array.isArray(insert)) {
				for (let i = 0; i < insert.length; i++) {
					this.syncroStates.splice(
						start,
						0,
						createSyncroState({
							key: start,
							validator: this.validator.$schema.shape,
							parent: this
						})
					);
					start += i + 1;
				}
			}
		});
	};

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
			this.transact(() => {
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
			this.transact(() => {
				this.yType.delete(0, 1);
				first?.destroy();
			});
			return first?.value;
		},
		unshift: (...items: T[]) => {
			let result;
			this.transact(() => {
				result = this.syncroStates.unshift(
					...items.map((item, index) => {
						return createSyncroState({
							forceNewType: true,
							key: index,
							validator: this.validator.$schema.shape,
							parent: this,
							value: item
						});
					})
				);
			});
			return result;
		},
		push: (...items: T[]) => {
			this.transact(() => {
				this.syncroStates.push(
					...items.map((item, index) => {
						return createSyncroState({
							key: this.yType.length,
							validator: this.validator.$schema.shape,
							parent: this,
							value: item
						});
					})
				);
			});
		},
		splice: (start: number, deleteCount: number, ..._items: T[]) => {
			let result: any[] = [];
			this.transact(() => {
				const newSyncroStates = _items.map((item, index) => {
					this.yType.delete(start, deleteCount);
					return createSyncroState({
						key: start + index,
						forceNewType: true,
						validator: this.validator.$schema.shape,
						parent: this,
						value: item
					});
				});
				if (deleteCount) {
					for (let i = 0; i < deleteCount; i++) {
						const state = this.syncroStates[start + i];
						if (state) {
							state.destroy();
						}
					}
				}
				result = this.syncroStates.splice(start, deleteCount, ...newSyncroStates);
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
