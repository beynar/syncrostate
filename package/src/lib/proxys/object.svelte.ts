import * as Y from 'yjs';
import type { ObjectValidator } from '../schemas/object.js';
import type { Validator } from '../schemas/schema.js';
import { isMissingOptionnal } from '../utils.js';
import { type SyncroStates, createSyncroState } from './syncroState.svelte.js';

export class SyncedObject {
	INTERNAL_ID: string;
	validator: ObjectValidator<any>;
	yType: Y.Map<any>;
	syncroStates = $state<Record<string, SyncroStates>>({});
	baseImplementation = {};
	proxy: any;

	private deleteProperty = (target: any, p: any) => {
		if (typeof p !== 'string') {
			return true;
		}

		const syncroState = this.syncroStates[p];
		if (!syncroState) {
			console.error('Property does not exist', p);
			return true;
		} else if (!syncroState.validator.$schema.optional) {
			console.error('Can not delete non optional property', p);
			return true;
		}
		this.yType.delete(p);
		syncroState.destroy();
		delete this.syncroStates[p];
		return true;
	};

	private transact = (fn: () => void) => {
		this.yType.doc?.transact(fn, this.INTERNAL_ID);
	};

	set value(input: any) {
		const { isValid, value } = this.validator.parse(input);
		if (!isValid) {
			console.error('Invalid value', { value });
			return;
		}
		const shape = this.validator.$schema.shape;
		this.transact(() => {
			if (!value) {
				// TODO: handle when value is null or undefined
				// we should delete all states
				// but i do not know how to mark this value as null or undefined
				// in the yjs doc as it is not a YText;
			} else {
				const remainingStates = Object.keys(this.syncroStates).filter((key) => !(key in value));
				remainingStates.forEach((key) => {
					this.syncroStates[key].destroy();
					delete this.syncroStates[key];
					this.yType.delete(key);
				});
				Object.entries(value).forEach(([key, value]) => {
					if (key in shape) {
						if (this.syncroStates[key]) {
							this.syncroStates[key].value = value;
						} else {
							this.syncroStates[key] = createSyncroState({
								key,
								validator: shape[key],
								parent: this.yType,
								value
							});
						}
					}
				});
			}
		});
	}

	get value() {
		return this.proxy;
	}
	constructor({
		observe = true,
		validator,
		yType,
		baseImplementation = {},
		value
	}: {
		observe?: boolean;
		validator: ObjectValidator<any>;
		yType: Y.Map<any>;
		baseImplementation?: any;
		value?: any;
	}) {
		this.INTERNAL_ID = crypto.randomUUID();
		this.validator = validator;
		this.yType = yType;
		this.baseImplementation = baseImplementation;
		const shape = this.validator.$schema.shape;
		this.proxy = new Proxy(this.baseImplementation, {
			get: (target: any, key: any) => {
				if (key[0] === '$') {
					return Reflect.get(target, key);
				}

				if (key === 'toJSON') {
					return this.toJSON();
				}

				const syncroState = this.syncroStates[key];

				if (!syncroState) {
					return undefined;
				}
				return syncroState.value;
			},
			set: (target: any, key: any, value: any) => {
				if (!(key in this.validator.$schema.shape)) {
					return false;
				}
				if (value === undefined) {
					return this.deleteProperty(target, key);
				}
				const syncroState = this.syncroStates[key];
				if (!syncroState) {
					this.transact(() => {
						this.syncroStates[key] = createSyncroState({
							key,
							validator: shape[key],
							parent: this.yType,
							value
						});
					});
				} else {
					syncroState.value = value;
				}
				return true;
			},

			deleteProperty: this.deleteProperty,

			has: (target: any, key: any) => {
				if (typeof key !== 'string') {
					return false;
				}
				return this.yType.has(key);
			},

			getOwnPropertyDescriptor(target: any, key: any) {
				if ((typeof key === 'string' && yType.has(key)) || key === 'toJSON') {
					return {
						enumerable: true,
						configurable: true
					};
				}

				return undefined;
			},

			ownKeys: () => Array.from(this.yType.keys())
		});
		if (observe) {
			yType.observe(this.observe);
			this.sync(value || this.validator.$schema.default);
		}
	}
	observe = (e: Y.YMapEvent<any>, _transaction: Y.Transaction) => {
		if (_transaction.origin === this.INTERNAL_ID) {
			return;
		}
		e.changes?.keys.forEach(({ action }, key) => {
			const syncedType = this.syncroStates[key];
			if (action === 'delete' && syncedType) {
				syncedType.destroy();
				delete this.syncroStates[key];
			}
			if (action === 'add') {
				// If a new key is added to the object and is valid, integrate it
				const syncroState = createSyncroState({
					key,
					validator: this.validator.$schema.shape[key] as Validator,
					parent: this.yType
				});

				Object.assign(this.syncroStates, { [key]: syncroState });
			}
		});
	};

	toJSON = () => {
		return Object.entries(this.validator.$schema.shape).reduce((acc, [key, validator]) => {
			const value = this.syncroStates[key]?.value;
			if (value !== undefined) {
				Object.assign(acc, { [key]: value });
			}
			return acc;
		}, {});
	};

	sync = (value?: any) => {
		this.syncroStates = {};
		(Object.entries(this.validator.$schema.shape) as [string, Validator][]).forEach(
			([key, validator]) => {
				if (isMissingOptionnal({ validator, parent: this.yType, key })) {
					return;
				}
				this.syncroStates[key] = createSyncroState({
					key,
					validator: validator,
					parent: this.yType,
					value: value?.[key]
				});
			}
		);
	};

	destroy = () => {
		this.yType.unobserve(this.observe);
		Object.values(this.syncroStates).forEach((syncroState) => {
			syncroState.destroy();
		});
		this.syncroStates = {};
	};
}
