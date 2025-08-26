import * as Y from 'yjs';
import type { DiscriminatedUnionValidator } from '../schemas/discriminatedUnion.js';
import type { ObjectValidator } from '../schemas/object.js';
import type { State } from './syncroState.svelte.js';
import type { SyncedContainer } from './common.js';
import { logError } from '../utils.js';
import { NULL_OBJECT } from '$lib/constants.js';

export class SyncedDiscriminatedUnion {
	state: State;
	validator: DiscriminatedUnionValidator<any, any>;
	yType: Y.Map<any>;
	currentVariant: ObjectValidator<any> | null = $state(null);
	currentData: Record<string, any> = $state({});
	proxy: any;
	parent: SyncedContainer;
	key: string | number;
	isNull: boolean = $state(false);

	deleteProperty = (target: any, p: any) => {
		// For discriminated unions, we manage the data directly
		if (this.currentVariant && typeof p === 'string' && p in this.currentVariant.$schema.shape) {
			const validator = this.currentVariant.$schema.shape[p];
			if (validator.$schema.optional) {
				this.state.transaction(() => {
					delete this.currentData[p];
					this.syncToYjs();
				});
				return true;
			}
		}
		return false;
	};

	setNull() {
		this.isNull = true;
		this.currentVariant = null;
		this.currentData = {};
		this.yType.set(NULL_OBJECT, new Y.Text(NULL_OBJECT));
	}

	// Sync current data to Yjs
	syncToYjs() {
		// Clear all existing keys first
		for (const key of this.yType.keys()) {
			if (key !== NULL_OBJECT) {
				this.yType.delete(key);
			}
		}

		// Set new data
		for (const [key, value] of Object.entries(this.currentData)) {
			const textValue = typeof value === 'string' ? value : JSON.stringify(value);
			this.yType.set(key, new Y.Text(textValue));
		}
	}

	// Sync from Yjs to current data
	syncFromYjs() {
		this.currentData = {};
		for (const [key, yValue] of this.yType.entries()) {
			if (key !== NULL_OBJECT && yValue instanceof Y.Text) {
				const textValue = yValue.toString();
				try {
					// Try to parse as JSON, fallback to string
					this.currentData[key] = JSON.parse(textValue);
				} catch {
					this.currentData[key] = textValue;
				}
			}
		}
	}

	private getVariantByDiscriminant(discriminantValue: any): ObjectValidator<any> | null {
		for (const variant of this.validator.$schema.variants) {
			const discriminantValidator = variant.$schema.shape[this.validator.$schema.discriminantKey];
			if (discriminantValidator && discriminantValidator.isValid(discriminantValue)) {
				return variant;
			}
		}
		return null;
	}

	set value(input: any) {
		const { isValid, value } = this.validator.parse(input);

		if (!isValid) {
			logError('Invalid discriminated union value', { value });
			return;
		}

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
					this.yType.delete(NULL_OBJECT);
				}

				// Get the discriminant value to determine which variant to use
				const discriminantValue = value[this.validator.$schema.discriminantKey];
				const matchingVariant = this.getVariantByDiscriminant(discriminantValue);

				if (!matchingVariant) {
					logError('No matching variant found for discriminant value', { discriminantValue });
					return;
				}

				// Update the variant and data
				this.currentVariant = matchingVariant;
				this.currentData = { ...value };
				this.syncToYjs();
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
		value,
		parent,
		key
	}: {
		state: State;
		observe?: boolean;
		validator: DiscriminatedUnionValidator<any, any>;
		yType: Y.Map<any>;
		value?: any;
		parent: SyncedContainer;
		key: string | number;
	}) {
		this.parent = parent;
		this.state = state;
		this.key = key;
		this.validator = validator;
		this.yType = yType;

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
						return this.toJSON();
					}

					// Forward property access to the current data
					if (this.currentData && typeof prop === 'string') {
						return this.currentData[prop];
					}
					return undefined;
				},
				set: (target: any, prop: any, newValue: any) => {
					if (!this.currentVariant || typeof prop !== 'string') {
						return false;
					}

					// Validate the property exists in the current variant
					if (!(prop in this.currentVariant.$schema.shape)) {
						return false;
					}

					// Special handling for discriminant property changes
					if (prop === this.validator.$schema.discriminantKey) {
						// Need to potentially switch variants
						const newVariant = this.getVariantByDiscriminant(newValue);
						if (newVariant && newVariant !== this.currentVariant) {
							// Create new object with the discriminant change
							const newObject = { ...this.currentData, [prop]: newValue };
							this.value = newObject;
							return true;
						}
					}

					// Normal property update within the same variant
					this.state.transaction(() => {
						this.currentData[prop] = newValue;
						this.syncToYjs();
					});
					return true;
				},
				deleteProperty: this.deleteProperty,
				has: (target: any, prop: any) => {
					if (this.currentData && typeof prop === 'string') {
						return prop in this.currentData;
					}
					return false;
				},
				getOwnPropertyDescriptor(target: any, prop: any) {
					console.log('DESCRIPTOR: prop:', prop, 'currentData:', JSON.stringify(this.currentData));
					if (this.currentData && typeof prop === 'string' && prop in this.currentData) {
						const descriptor = {
							enumerable: true,
							configurable: true,
							writable: true,
							value: this.currentData[prop]
						};
						console.log('DESCRIPTOR: returning:', descriptor);
						return descriptor;
					}
					console.log('DESCRIPTOR: returning undefined');
					return undefined;
				},
				ownKeys: () => {
					console.log('OWNKEYS: currentData:', JSON.stringify(this.currentData));
					console.log('OWNKEYS: isNull:', this.isNull);
					if (this.currentData) {
						const keys = Object.keys(this.currentData);
						console.log('OWNKEYS: returning keys:', keys);
						return keys;
					}
					console.log('OWNKEYS: returning empty array');
					return [];
				}
			}
		);

		if (observe) {
			yType.observe(this.observe);
			this.sync(value);
		}
	}

	observe = (e: Y.YMapEvent<any>, _transaction: Y.Transaction) => {
		if (_transaction.origin !== this.state.transactionKey) {
			if (this.yType.has(NULL_OBJECT)) {
				this.isNull = true;
				this.currentData = {};
				this.currentVariant = null;
				return;
			}
			// Sync from Yjs changes
			this.syncFromYjs();
			// Determine current variant from the data
			if (this.currentData[this.validator.$schema.discriminantKey]) {
				const discriminantValue = this.currentData[this.validator.$schema.discriminantKey];
				this.currentVariant = this.getVariantByDiscriminant(discriminantValue);
			}
		}
	};

	toJSON = () => {
		if (this.isNull) {
			return null;
		}
		return { ...this.currentData };
	};

	sync = (value?: any) => {
		this.state.transaction(() => {
			this.currentData = {};
			this.currentVariant = null;

			if (this.yType.has(NULL_OBJECT)) {
				this.isNull = true;
				return;
			}

			// If we have a value, use it directly
			if (value && typeof value === 'object') {
				const discriminantValue = value[this.validator.$schema.discriminantKey];
				const matchingVariant = this.getVariantByDiscriminant(discriminantValue);

				if (matchingVariant) {
					this.currentVariant = matchingVariant;
					this.currentData = { ...value };
					this.syncToYjs();
				}
			} else {
				// Sync from existing Yjs data
				this.syncFromYjs();
				if (this.currentData[this.validator.$schema.discriminantKey]) {
					const discriminantValue = this.currentData[this.validator.$schema.discriminantKey];
					this.currentVariant = this.getVariantByDiscriminant(discriminantValue);
				}
			}
		});
	};

	destroy = () => {
		this.yType.unobserve(this.observe);
		this.currentData = {};
		this.currentVariant = null;
	};
}
