import * as Y from 'yjs';
import type { ObjectValidator } from '../schemas/object.js';
import type { Validator } from '../schemas/schema.js';
import { isMissingOptionnal } from '../utils.js';
import { type State, type SyncroStates, createSyncroState } from './syncroState.svelte.js';
import type { SyncedContainer } from './common.js';
import { logError } from '../utils.js';
import { NULL_OBJECT } from '$lib/constants.js';

export class SyncedObject {
	state: State;
	validator: ObjectValidator<any>;
	yType: Y.Map<any>;
	syncroStates = $state<Record<string, SyncroStates>>({});
	baseImplementation = {};
	proxy: any;
	parent: SyncedContainer;
	key: string | number;
	isNull: boolean = $state(false);
	onObserve?: (e: Y.YMapEvent<any>, _transaction: Y.Transaction) => void;

	deleteProperty = (target: any, p: any) => {
		if (typeof p !== 'string') {
			return true;
		}

		const syncroState = this.syncroStates[p];
		if (!syncroState) {
			logError('Property does not exist', p);
			return true;
		} else if (!syncroState.validator.$schema.optional) {
			logError('Can not delete non optional property', p);
			return true;
		}
		syncroState.destroy();
		this.yType.delete(p);
		delete this.syncroStates[p];
		return true;
	};

	setNull() {
		this.isNull = true;
		this.yType.set(NULL_OBJECT, new Y.Text(NULL_OBJECT));
	}

	set value(input: any) {
		const { isValid, value } = this.validator.parse(input);

		if (!isValid) {
			logError('Invalid value', { value });
			return;
		}

		this.state.transaction(() => {
			const shape = this.validator.$schema.shape;

			if (!value) {
				if (value === undefined) {
					this.parent.deleteProperty({}, this.key);
				} else {
					this.setNull();
				}
			} else {
				if (this.isNull) {
					this.isNull = false;
					this.yType.delete(NULL_OBJECT);
				}
				// Delete syncro states that are not in the new value
				Object.keys(this.syncroStates)
					.filter((key) => !(key in value))
					.forEach((key) => {
						this.syncroStates[key].destroy();
						this.yType.delete(key);
						delete this.syncroStates[key];
					});

				Object.entries(value).forEach(([key, value]) => {
					if (key in shape) {
						const syncroState = this.syncroStates[key];
						if (syncroState) {
							if (syncroState.validator.$schema !== shape[key].$schema) {
								syncroState.destroy();
								this.syncroStates[key] = createSyncroState({
									key,
									validator: shape[key],
									parent: this,
									state: this.state,
									forceValue: true,
									forceNewType: true,
									value
								});
							} else {
								syncroState.value = value;
							}
						} else {
							this.syncroStates[key] = createSyncroState({
								key,
								validator: shape[key],
								parent: this,
								state: this.state,
								value
							});
						}
					}
				});
			}
		});
	}

	get value() {
		if (this.isNull) {
			return null;
		}
		return this.proxy;
	}
	constructor({
		state,
		observe = true,
		validator,
		yType,
		baseImplementation = {},
		value,
		parent,
		key,
		onObserve
	}: {
		state: State;
		observe?: boolean;
		validator: ObjectValidator<any>;
		yType: Y.Map<any>;
		baseImplementation?: any;
		value?: any;
		parent: SyncedContainer;
		key: string | number;
		onObserve?: (e: Y.YMapEvent<any>, _transaction: Y.Transaction) => void;
	}) {
		this.parent = parent;
		this.state = state;
		this.key = key;
		this.validator = validator;
		this.yType = yType;
		this.baseImplementation = baseImplementation;
		this.onObserve = onObserve;

		this.proxy = new Proxy(
			{},
			{
				get: (target: any, prop: any) => {
					if (prop === 'getState') {
						return () => state;
					}
					if (prop === 'getYType') {
						return () => yType;
					}

					if (prop === 'getYTypes') {
						return () => Object.fromEntries(yType.entries());
					}

					if (prop === 'toJSON') {
						return this.toJSON.bind(this);
					}

					const syncroState = this.syncroStates[prop];

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
						this.state.transaction(() => {
							this.syncroStates[key] = createSyncroState({
								key,
								validator: this.validator.$schema.shape[key],
								parent: this,
								state: this.state,
								value
							});
						});
					} else {
						syncroState.value = value;
					}
					return true;
				},

				deleteProperty: this.deleteProperty,

				has: (target: any, prop: any) => {
					if (typeof prop !== 'string') {
						return false;
					}
					console.log('has', { prop }, this.yType.has(prop), this.yType.get(prop));
					return this.yType.has(prop);
				},

				getOwnPropertyDescriptor(target: any, prop: any) {
					if ((typeof prop === 'string' && yType.has(prop)) || prop === 'toJSON') {
						return {
							enumerable: true,
							configurable: true
						};
					}

					return undefined;
				},

				ownKeys: () => Array.from(this.yType.keys())
			}
		);
		if (observe) {
			yType.observe(this.observe);
			this.sync(value);
		}
	}
	observe = (e: Y.YMapEvent<any>, _transaction: Y.Transaction) => {
		if (_transaction.origin !== this.state.transactionKey) {
			this.onObserve?.(e, _transaction);
			if (this.yType.has(NULL_OBJECT)) {
				this.isNull = true;
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
					const validator = this.validator.$schema.shape[key];

					const syncroState = createSyncroState({
						key,
						validator: validator as Validator,
						state: this.state,
						parent: this
					});

					Object.assign(this.syncroStates, { [key]: syncroState });
				}
			});
		}
	};

	toJSON = () => {
		if (this.isNull) {
			return null;
		}
		return Object.entries(this.validator.$schema.shape).reduce((acc, [key, validator]) => {
			const value = this.syncroStates[key]?.value;
			if (value !== undefined) {
				Object.assign(acc, { [key]: value });
			}
			return acc;
		}, {});
	};

	sync = (value?: any) => {
		this.state.transaction(() => {
			this.syncroStates = {};
			if (this.yType.has(NULL_OBJECT)) {
				this.isNull = true;
				return;
			}
			const hasDefaultValue = this.validator.$schema.default;
			if (!hasDefaultValue) {
				if (this.validator.$schema.nullable && !value) {
					this.setNull();
					return;
				}
			}
			(Object.entries(this.validator.$schema.shape) as [string, Validator][]).forEach(
				([key, validator]) => {
					if (isMissingOptionnal({ validator, parent: this.yType, key })) {
						return;
					}

					this.syncroStates[key] = createSyncroState({
						key,
						validator: validator,
						parent: this,
						value: value?.[key] || this.validator.$schema.default?.[key],
						state: this.state
					});
				}
			);
		});
	};

	destroy = () => {
		this.yType.unobserve(this.observe);
		Object.values(this.syncroStates).forEach((syncroState) => {
			syncroState.destroy();
		});
		this.syncroStates = {};
	};
}
