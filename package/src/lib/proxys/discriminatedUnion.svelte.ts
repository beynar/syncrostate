import * as Y from 'yjs';
import type { DiscriminatedUnionValidator } from '../schemas/discriminatedUnion.js';
import type { ObjectValidator } from '../schemas/object.js';
import { createSyncroState, type State } from './syncroState.svelte.js';
import { SyncedObject } from './object.svelte.js';
import type { SyncedContainer } from './common.js';
import { logError } from '../utils.js';
import { NULL_OBJECT } from '$lib/constants.js';
import type { Validator } from '$lib/schemas/schema.js';

export class SyncedDiscriminatedUnion {
	state: State;
	validator: DiscriminatedUnionValidator<any, any>;
	objectProxy: SyncedObject | null = $state(null);
	parent: SyncedContainer;
	key: string | number;

	get currentVariant() {
		return this.objectProxy?.validator;
	}

	get yType() {
		return this.objectProxy?.yType;
	}

	get isNull() {
		return this.objectProxy?.isNull || false;
	}
	get proxy() {
		return this.objectProxy!.proxy;
	}

	set value(input: any) {
		const { isValid, value } = this.validator.parse(input);

		if (!isValid) {
			logError('Invalid value', { input });
			return;
		}
		if (!value) {
			this.state.transaction(() => {
				// Let discriminated union handle null and undefined
				// It can be nullable or optional
				// But the underlying object proxy can or can not reflect that aspect
				if (value === undefined) {
					this.parent.deleteProperty({}, this.key);
				} else {
					this.objectProxy!.setNull();
				}
			});
		} else {
			const newDiscriminantValue =
				this.validator.$schema.discriminantKey in value &&
				(value as any)[this.validator.$schema.discriminantKey];
			const oldDiscriminantValue =
				this.objectProxy?.value?.[this.validator.$schema.discriminantKey];
			if (newDiscriminantValue !== oldDiscriminantValue) {
				this.swapValidator(newDiscriminantValue);
			}
			// Call the set trap of the object proxy
			this.objectProxy!.value = value;
		}
	}

	get value() {
		return this.objectProxy!.value;
	}

	// Simple forwarding - discriminated union doesn't manage properties directly
	deleteProperty = (target: any, p: any) => {
		return this.objectProxy?.deleteProperty(target, p) || false;
	};

	setNull() {
		this.objectProxy?.setNull();
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

	private swapValidator(discriminantValue?: string) {
		if (!discriminantValue) {
			return;
		}
		const matchingValidator = this.getVariantByDiscriminant(discriminantValue);
		if (matchingValidator) {
			this.objectProxy!.validator = matchingValidator;
		}
	}

	constructor({
		state,
		observe = true,
		validator,
		yType,
		value,
		parent,
		key,
		baseImplementation = {}
	}: {
		state: State;
		observe?: boolean;
		validator: DiscriminatedUnionValidator<any, any>;
		yType: Y.Map<any>;
		value?: any;
		parent: SyncedContainer;
		key: string | number;
		baseImplementation?: any;
	}) {
		this.parent = parent;
		this.state = state;
		this.key = key;
		this.validator = validator;

		let objectValidator = this.validator.$schema.variantValidators[0];

		if (observe)
			if (yType.has(this.validator.$schema.discriminantKey)) {
				const discriminantValue = yType.get(this.validator.$schema.discriminantKey);
				objectValidator = this.getVariantByDiscriminant(discriminantValue) || objectValidator;
			} else if (value) {
				const discriminantValue = value?.[this.validator.$schema.discriminantKey];
				objectValidator = this.getVariantByDiscriminant(discriminantValue) || objectValidator;
			}

		// We need to get the current variant from the yType if the document has already been initialized.
		// Otherwise we need to get the variant from the validator default value if there is one.
		// Otherwise we need to get the variant from the first validator in the array.

		this.objectProxy = new SyncedObject({
			validator: objectValidator,
			yType,
			parent,
			key,
			state,
			value,
			observe,
			baseImplementation,
			onObserve: this.observe
		});
	}

	toJSON = () => {
		return this.objectProxy!.toJSON();
	};

	observe = (e: Y.YMapEvent<any>, _transaction: Y.Transaction) => {
		// Only handle external changes (not our own)
		const discriminantKeyChange = e.changes.keys.get(this.validator.$schema.discriminantKey);
		if (discriminantKeyChange) {
			const discriminantValue = e.target.get(this.validator.$schema.discriminantKey)?.toString();
			this.swapValidator(discriminantValue);
		}
		const objectProxy = this.objectProxy;
		if (!objectProxy) return;

		const shape = this.currentVariant!.$schema.shape;

		Object.keys(objectProxy.syncroStates).forEach((k) => {
			if (!(k in shape)) {
				objectProxy.syncroStates[k].destroy();
				delete objectProxy.syncroStates[k];
			}
		});

		Object.entries(shape).forEach(([key, validator]) => {
			const syncedState = objectProxy.syncroStates[key];

			if (!syncedState) {
				objectProxy.syncroStates[key] = createSyncroState({
					key,
					validator: validator as Validator,
					parent: objectProxy,
					state: this.state
				});
			} else {
				if (syncedState.validator !== shape[key]) {
					syncedState.destroy();
					objectProxy.syncroStates[key] = createSyncroState({
						key,
						validator: validator as Validator,
						parent: objectProxy,
						state: this.state
					});
				}
			}
		});
	};

	sync = (value?: any) => {
		return this.objectProxy!.sync(value);
	};

	destroy = () => {
		this.objectProxy!.destroy();
		this.objectProxy = null;
	};
}
