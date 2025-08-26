import * as Y from 'yjs';
import type { DiscriminatedUnionValidator } from '../schemas/discriminatedUnion.js';
import type { ObjectValidator } from '../schemas/object.js';
import { type State } from './syncroState.svelte.js';
import { SyncedObject } from './object.svelte.js';
import type { SyncedContainer } from './common.js';
import { logError } from '../utils.js';
import { NULL_OBJECT } from '$lib/constants.js';

export class SyncedDiscriminatedUnion {
	state: State;
	validator: DiscriminatedUnionValidator<any, any>;
	yType: Y.Map<any>;
	currentObjectProxy: SyncedObject | null = $state(null);
	currentVariant: ObjectValidator<any> | null = $state(null);
	proxy: any;
	parent: SyncedContainer;
	key: string | number;
	isNull: boolean = $state(false);

	// Simple forwarding - discriminated union doesn't manage properties directly
	deleteProperty = (target: any, p: any) => {
		return this.currentObjectProxy?.deleteProperty(target, p) || false;
	};

	setNull() {
		this.isNull = true;
		this.currentObjectProxy?.destroy();
		this.currentObjectProxy = null;
		this.currentVariant = null;
		this.yType.set(NULL_OBJECT, new Y.Text(NULL_OBJECT));
	}

	// Find which variant matches the discriminant value
	private getVariantByDiscriminant(discriminantValue: any): ObjectValidator<any> | null {
		for (const variant of this.validator.$schema.variantValidators) {
			const discriminantValidator = variant.$schema.shape[this.validator.$schema.discriminantKey];
			if (discriminantValidator && discriminantValidator.isValid(discriminantValue)) {
				return variant;
			}
		}
		return null;
	}

	private switchVariantIfNeeded(variant: ObjectValidator<any>) {
		// Only recreate the object proxy if the variant changed
		if (this.currentVariant !== variant) {
			// Destroy the old proxy first
			this.currentObjectProxy?.destroy();

			this.currentVariant = variant;
			this.currentObjectProxy = new SyncedObject({
				validator: variant,
				yType: this.yType, // Share the same yType
				parent: this.parent,
				key: this.key,
				state: this.state,
				observe: true // Let SyncedObject handle observation
			});
		}
	}

	set value(input: any) {
		const { isValid, value } = this.validator.parse(input);

		console.log({ value });

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

				// Find the matching variant
				const discriminantValue = value[this.validator.$schema.discriminantKey];
				const matchingVariant = this.getVariantByDiscriminant(discriminantValue);

				if (!matchingVariant) {
					logError('No matching variant found for discriminant value', { discriminantValue });
					return;
				}

				this.switchVariantIfNeeded(matchingVariant);

				// Set the value on the object proxy - this will handle the Yjs sync
				if (this.currentObjectProxy) {
					this.currentObjectProxy.value = value;
				}
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

		// Proxy forwards everything to the current object proxy
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

					// Forward to current object proxy
					if (this.currentObjectProxy) {
						return this.currentObjectProxy.value[prop];
					}
					return undefined;
				},
				set: (target: any, prop: any, newValue: any) => {
					if (this.currentObjectProxy) {
						// Special handling for discriminant property changes
						if (prop === this.validator.$schema.discriminantKey) {
							// Get current value and update discriminant
							const currentValue = this.toJSON();
							const newObject = { ...currentValue, [prop]: newValue };
							this.value = newObject;
							return true;
						}

						// Normal property update - forward to object
						this.currentObjectProxy.value[prop] = newValue;
						return true;
					}
					return false;
				},
				deleteProperty: this.deleteProperty,
				has: (target: any, prop: any) => {
					if (this.currentObjectProxy && this.currentVariant) {
						// Only return true for properties that exist in the current variant's shape
						return prop in this.currentVariant.$schema.shape;
					}
					return false;
				},
				getOwnPropertyDescriptor: (target: any, prop: any) => {
					if (this.currentObjectProxy) {
						return Object.getOwnPropertyDescriptor(this.currentObjectProxy.value, prop);
					}
					return undefined;
				},
				ownKeys: (target: any) => {
					if (this.currentObjectProxy && this.currentVariant) {
						// Only return keys that exist in the current variant's shape
						return Object.keys(this.currentVariant.$schema.shape);
					}
					return [];
				}
			}
		);

		// Set up observation for collaboration if needed
		if (observe) {
			yType.observe(this.observe);
			this.sync(value);
		} else if (value) {
			this.value = value;
		}
	}

	toJSON = () => {
		if (this.isNull) {
			return null;
		}
		if (this.currentObjectProxy) {
			return this.currentObjectProxy.toJSON();
		}
		return null;
	};

	// Observer for external Yjs changes - ONLY handle discriminant changes
	observe = (e: Y.YMapEvent<any>, _transaction: Y.Transaction) => {
		// Only handle external changes (not our own)
		if (_transaction.origin !== this.state.transactionKey) {
			const discriminantKey = this.validator.$schema.discriminantKey;

			// Check if this might be a variant switch by checking the discriminant value
			let shouldSync = false;

			if (e.changes.keys.has(discriminantKey) || !this.currentVariant) {
				// Discriminant key changed or no variant yet - definitely sync

				console.log('discriminant key changed', shouldSync);
				shouldSync = true;
			} else if (e.changes.keys.size > 0) {
				// Some other keys changed - check if discriminant value implies a different variant
				const currentDiscriminantValue = this.yType.get(discriminantKey);
				if (currentDiscriminantValue instanceof Y.Text) {
					let discriminantValue;
					try {
						discriminantValue = JSON.parse(currentDiscriminantValue.toString());
					} catch {
						discriminantValue = currentDiscriminantValue.toString();
					}
					const matchingVariant = this.getVariantByDiscriminant(discriminantValue);
					if (matchingVariant && this.currentVariant !== matchingVariant) {
						shouldSync = true;
					}
				}
			}

			if (shouldSync) {
				this.syncFromExternalChange();
			}
		}
	};

	// Handle external changes by recreating the correct variant
	private syncFromExternalChange() {
		if (this.yType.has(NULL_OBJECT)) {
			this.isNull = true;
			this.currentObjectProxy?.destroy();
			this.currentObjectProxy = null;
			this.currentVariant = null;
			return;
		}

		// Get discriminant value from Yjs
		const discriminantKey = this.validator.$schema.discriminantKey;
		const yValue = this.yType.get(discriminantKey);
		if (yValue instanceof Y.Text) {
			const textValue = yValue.toString();
			let discriminantValue;
			try {
				discriminantValue = JSON.parse(textValue);
			} catch {
				discriminantValue = textValue;
			}

			const matchingVariant = this.getVariantByDiscriminant(discriminantValue);
			if (matchingVariant && this.currentVariant !== matchingVariant) {
				console.log('switching variant', matchingVariant, discriminantValue);
				// Destroy old variant and create new one
				this.currentObjectProxy?.destroy();
				this.currentVariant = matchingVariant;
				this.currentObjectProxy = new SyncedObject({
					validator: matchingVariant,
					yType: this.yType,
					parent: this.parent,
					key: this.key,
					state: this.state,
					observe: true // Let the object handle its own observation
				});
				// Trigger sync to pick up existing data
				this.currentObjectProxy.sync();
				this.isNull = false;
			}
		}
	}

	sync = (value?: any) => {
		// For discriminated union, handle initial sync from existing data
		if (value && typeof value === 'object') {
			this.value = value;
		} else {
			// Check if there's existing data in Yjs
			this.syncFromExternalChange();
		}
	};

	destroy = () => {
		this.yType.unobserve(this.observe);
		this.currentObjectProxy?.destroy();
		this.currentObjectProxy = null;
		this.currentVariant = null;
	};
}

const review = `
I think this is overcomplicated.

The discriminated union proxy should just be a proxy to the current object proxy.

It should listen to discriminant changes and switch the current object proxy to the correct variant.

The set trap should check for the discriminant key and switch the current object proxy to the correct variant.

The get trap should forward to the current object proxy.

The real difficulty of the discriminated union is around the discriminant switch.
These are the scenarios to consider:
[LOCAL CHANGE]
 - When the whole object is replaced with a new object => we need to get the validator associated with the discriminant value and check if the [new] object is valid for that validator.
 - When the discriminant key value changes => we need to get the validator associated with the new discriminant value and check if the [old] object is valid for that validator.
 
[REMOTE CHANGE]
In the event of a remote change, we assume that the shape of the object is valid. 
But the discriminant value might have changed and therefore the discriminated union needs to switch to the correct variant.



in the set trap (of the whole value) 

we first determine if the discriminant key is in the new value. 
Then we check if the discriminant key has changed. 
- If not: we delegate the validation to the current object proxy.
- If so: we change the object proxy validator and then delegate the validation to the new object proxy.


In the set trap (of a single property)
If this property is the discriminant key we check if it has changed. 
- If not we do nothing and let the object proxy trap handle the property change.
- If so 
 	- we switch the appropriate validator
	- we validate the current object proxy value with the new validator
	- we do perform a set of the whole value like in the previous scenario

`;
