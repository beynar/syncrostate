import * as Y from 'yjs';
import { SvelteSet } from 'svelte/reactivity';

import {
	createYTypesArrayProxy,
	isArrayNull,
	logError,
	observeArray,
	propertyToNumber,
	setArrayToNull
} from '../utils.js';
import { createSyncroState, type State, type SyncroStates } from './syncroState.svelte.js';
import type { SyncedContainer } from './common.js';
import type { SetValidator } from '$lib/schemas/set.js';

export class SyncedSet {
	state: State;
	validator: SetValidator<any>;
	yType: Y.Array<any>;
	parent: SyncedContainer;
	key: string | number;
	isNull = $state(false);
	syncroStates = $state<SyncroStates[]>([]);
	syncroStatesValues = new SvelteSet<any[]>();
	setNull = setArrayToNull.bind(this);
	observe = observeArray.bind(this);

	constructor(opts: {
		yType: Y.Array<any>;
		validator: SetValidator<any>;
		parent: SyncedContainer;
		key: string | number;
		state: State;
		value: any;
	}) {
		this.key = opts.key;
		this.state = opts.state;
		this.yType = opts.yType;
		this.parent = opts.parent;
		this.validator = opts.validator;
		this.sync(opts.value);
		this.yType.observe(this.observe);
	}

	sync = (value: any) => {
		const isSet = value instanceof Set;
		const isArray = Array.isArray(value);
		const arrayValue = isSet ? Array.from(value) : isArray ? value : null;
		this.state.transaction(() => {
			this.syncroStatesValues.clear();
			this.syncroStates = [];
			if (isArrayNull(this)) {
				this.isNull = true;
				return;
			}
			if (this.state.initialized || value) {
				for (let i = 0; i < Math.max(value?.length || 0, this.yType.length); i++) {
					this.addState(
						createSyncroState({
							key: i,
							validator: this.validator.$schema.shape,
							parent: this,
							value: value?.[i],
							state: this.state
						})
					);
				}
			} else {
				if (this.validator.$schema.default) {
					this.syncroStates = Array.from(this.validator.$schema.default).map((item, index) => {
						const state = createSyncroState({
							key: index,
							validator: this.validator.$schema.shape,
							parent: this,
							value: item,
							state: this.state
						});
						this.syncroStatesValues.add(state.value);
						return state;
					});
				} else if (this.validator.$schema.nullable && !value) {
					this.setNull();
				}
			}
		});
	};

	toJSON = () => {
		// it's not exactly right but maybe ok and useful
		return Array.from(this.syncroStates).map((state) => state.value);
	};

	addState = (state: SyncroStates) => {
		this.syncroStates.push(state);
		this.syncroStatesValues.add(state.value);
	};

	deleteProperty = (target: any, prop: any) => {
		const index = propertyToNumber(prop);
		if (typeof index !== 'number' || !this.syncroStates[index]) {
			return true;
		}

		this.syncroStatesValues.delete(this.syncroStates[index].value);
		this.syncroStates[index].destroy();
		this.syncroStates.splice(index, 1);
		this.yType.delete(index, 1);
	};

	destroy = () => {
		this.syncroStatesValues.clear();
		this.syncroStates = [];
	};

	proxySet = new Proxy(this.syncroStatesValues, {
		get: (target, prop) => {
			if (prop === 'getState') {
				return () => this.state;
			}
			if (prop === 'getType') {
				return () => this.yType;
			}
			if (prop === 'getTypes') {
				return () => new Set(createYTypesArrayProxy(this.yType));
			}
			if (prop === Symbol.iterator) {
				return () => this.syncroStatesValues.values();
			}

			const result = Reflect.get(target, prop);
			if (typeof result === 'function') {
				return (...args: any[]) => {
					if (typeof prop === 'string') {
						switch (prop) {
							case 'add': {
								const { isValid, value } = this.validator.$schema.shape.parse(args[0]);

								if (!isValid) {
									logError('Invalid value', { value });
									return false;
								}

								const hasValue = this.syncroStatesValues.has(value);

								if (hasValue) {
									return false;
								}
								this.state.transaction(() => {
									const state = createSyncroState({
										forceNewType: true,
										key: this.syncroStatesValues.size,
										validator: this.validator.$schema.shape,
										parent: this,
										value: value,
										state: this.state
									});
									this.addState(state);
								});

								return this.proxySet;
							}
							case 'delete': {
								const stateIndex = Array.from(this.syncroStates).findIndex(
									(state) => state.value === args[0]
								);
								if (stateIndex !== -1) {
									this.syncroStates[stateIndex].destroy();
								}
								this.deleteProperty(target, stateIndex);
								return this.proxySet;
							}
							case 'clear':
								{
									this.state.transaction(() => {
										Array.from(this.syncroStates).forEach((state) => state.destroy());
										this.yType.delete(0, this.yType.length);
										this.syncroStatesValues.clear();
										this.syncroStates = [];
									});
								}
								return this.proxySet;
							default:
								break;
						}
						return result.call(target, ...args);
					}
				};
			} else {
				return result;
			}
		}
	});

	get value() {
		if (this.isNull) {
			return null;
		}

		return this.proxySet;
	}

	set value(input: Set<any> | null) {
		const { isValid, value } = this.validator.parse(input);
		console.log({ value, isValid });
		if (!isValid) {
			logError('Invalid value', { value });
			return;
		} else {
			if (!value) {
				if (value === undefined) {
					// this.parent.deleteProperty({}, this.key);
				} else {
					this.setNull();
				}
			} else {
				this.syncroStatesValues.clear();
				const valueArray = Array.from(value);

				if (this.isNull) {
					this.isNull = false;
					this.yType.delete(0, this.yType.length);
				}
				if (!this.isNull) {
					const remainingStates = Array.from(this.syncroStates).slice(valueArray.length);
					remainingStates.forEach((state) => {
						state.destroy();
					});
					if (remainingStates.length) {
						this.yType.delete(valueArray.length, remainingStates.length);
					}
				}

				this.syncroStates = valueArray.map((item, index) => {
					const previsousState = this.syncroStates[index];
					if (previsousState) {
						previsousState.value = item;
						this.syncroStatesValues.add(previsousState.value);
						return previsousState;
					} else {
						const state = createSyncroState({
							forceNewType: true,
							key: index,
							validator: this.validator.$schema.shape,
							parent: this,
							value: item,
							state: this.state
						});
						this.syncroStatesValues.add(state.value);
						return state;
					}
				});
			}
		}
	}
}
