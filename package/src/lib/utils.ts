import * as Y from 'yjs';
import type { Validator } from './schemas/schema.js';
import { INITIALIZED, NULL, NULL_ARRAY } from './constants.js';
import type { BaseValidator } from './schemas/base.js';
import { DEV } from 'esm-env';
import type { SyncedArray } from './proxys/array.svelte.js';
import { SyncedSet } from './proxys/set.svelte.js';
import { createSyncroState } from './proxys/syncroState.svelte.js';

export const isMissingOptionnal = ({
	parent,
	key,
	validator
}: {
	parent: Y.Map<any> | Y.Array<any>;
	key: string | number;
	validator: Validator;
}) => {
	const exists = parent instanceof Y.Map ? parent.has(String(key)) : !!parent.get(Number(key));
	const isMissingOptionnal = validator.$schema.optional && !exists;
	const hasDefault = validator.$schema.default !== undefined;
	return isMissingOptionnal && !hasDefault;
};

export const getInitialStringifiedValue = (value: any, validator: Validator) => {
	if (
		validator.$schema.kind === 'array' ||
		validator.$schema.kind === 'object' ||
		validator.$schema.kind === 'set'
	) {
		return undefined;
	}
	const DEFAULT_VALUE = value === null ? null : (value ?? validator.$schema.default);

	const isValid = validator.isValid(DEFAULT_VALUE);
	if (!isValid) {
		if (validator.$schema.nullable) {
			return NULL;
		}
		return undefined;
	}
	if (DEFAULT_VALUE !== undefined) {
		const stringifiedDefaultValue = (validator as BaseValidator<any>).stringify(DEFAULT_VALUE);

		return stringifiedDefaultValue;
	}
};

export const getTypeFromParent = <T extends Y.Array<any> | Y.Map<any> | Y.Text>({
	parent,
	key,
	validator,
	forceNewType,
	value
}: {
	parent: Y.Map<any> | Y.Array<any>;
	key: string | number;
	value?: string;
	forceNewType?: boolean;
	validator: Validator;
}): T => {
	const isArray = parent instanceof Y.Array;
	const instance = getInstance(validator) as new () => Y.Array<any> | Y.Map<any> | Y.Text;
	const isText = instance === Y.Text;
	const stringifiedValue = getInitialStringifiedValue(value, validator);
	const type = isText ? new Y.Text(stringifiedValue) : new instance();
	const typeInParent = (isArray ? parent.get(Number(key)) : parent.get(String(key))) as T;

	const setAndReturnType = () => {
		if (isArray) {
			parent.insert(Number(key), [type]);
		} else {
			parent.delete(String(key));
			parent.set(String(key), type);
		}
		return type as T;
	};

	if (!typeInParent || typeInParent._item?.deleted || forceNewType) {
		return setAndReturnType() as T;
	}

	if (!(typeInParent instanceof instance)) {
		return setAndReturnType() as T;
	} else {
		return typeInParent as T;
	}
};

export const getInstance = (validator: Validator): (new () => Y.AbstractType<any>) | null => {
	switch (validator.$schema.kind) {
		case 'object':
			return Y.Map;
		case 'set':
		case 'array':
			return Y.Array;
		default:
			return Y.Text;
	}
};

export const logError = (...args: any[]) => {
	if (DEV) {
		console.error(...args);
	}
};

export const isInitialized = ({ yType }: { yType: Y.AbstractType<any> }) => {
	// @ts-ignore
	return yType.doc?.initialized;
};

// From https://github.com/YousefED/SyncedStore/blob/main/packages/core/src/array.ts
export const propertyToNumber = (p: string | number | symbol) => {
	if (typeof p === 'string' && p.trim().length) {
		const asNum = Number(p);
		if (Number.isInteger(asNum)) {
			return asNum;
		}
	}
	return p;
};

export function setArrayToNull(this: SyncedArray | SyncedSet) {
	this.isNull = true;
	this.yType.delete(0, this.yType.length);
	this.yType.insert(0, [new Y.Text(NULL_ARRAY)]);
}

export const isArrayNull = ({ yType }: { yType: Y.Array<any> }) => {
	return (
		yType.length === 1 && yType.get(0) instanceof Y.Text && yType.get(0).toString() === NULL_ARRAY
	);
};

export function observeArray(this: SyncedArray | SyncedSet) {
	return (e: Y.YArrayEvent<any>, _transaction: Y.Transaction) => {
		if (_transaction.origin !== this.state.transactionKey) {
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
						if (insert[i] instanceof Y.Text && insert[i].toString() === NULL_ARRAY) {
							this.isNull = true;
							return;
						}
						this.syncroStates.splice(
							start,
							0,
							createSyncroState({
								key: start,
								validator: this.validator.$schema.shape,
								parent: this,
								state: this.state
							})
						);
						start += 1;
					}
				}
			});
			if (this instanceof SyncedSet) {
				this.syncroStatesValues.clear();
				this.syncroStatesValues.add(this.syncroStates.map((state) => state.value));
			}
		}
	};
}
