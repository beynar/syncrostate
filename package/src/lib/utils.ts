import * as Y from 'yjs';
import type { Validator } from './schemas/schema.js';
import { NULL, NULL_ARRAY } from './constants.js';
import type { BaseValidator } from './schemas/base.js';
import { DEV } from 'esm-env';
import type { SyncedArray } from './proxys/array.svelte.js';
import { SyncedSet } from './proxys/set.svelte.js';
import { createSyncroState } from './proxys/syncroState.svelte.js';

export type Type =
	| 'string'
	| 'number'
	| 'boolean'
	| 'object'
	| 'array'
	| 'date'
	| 'set'
	| 'map'
	// enum is here just for typescript purpose. They do not exist in schemasless land
	| 'enum';

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

export const getInitialStringifiedValueFromValidator = (value: any, validator: Validator) => {
	if (
		validator.$schema.kind === 'array' ||
		validator.$schema.kind === 'object' ||
		validator.$schema.kind === 'map' ||
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
export const getStringifiedValueFromType = (value: any, type?: Type) => {
	if (type === 'array' || type === 'object' || type === 'map' || type === 'set' || !type) {
		return undefined;
	}

	if (value === null) {
		return NULL;
	}
	switch (type) {
		case 'string':
			return String(value);
		case 'number':
			return String(value);
		case 'boolean':
			return String(value);
		case 'date': {
			const date = value instanceof Date ? value : new Date(value);
			return date.toISOString();
		}
	}
};

export const getTypeOfValue = (value: any): Type => {
	if (typeof value === 'string') {
		return 'string';
	} else if (typeof value === 'number') {
		return 'number';
	} else if (typeof value === 'boolean') {
		return 'boolean';
	} else if (typeof value === 'object') {
		if (value instanceof Date) {
			return 'date';
		} else if (value instanceof Array) {
			return 'array';
		} else if (value instanceof Map) {
			return 'map';
		} else if (value instanceof Set) {
			return 'set';
		} else if (Object.keys(value).length > 0) {
			return 'object';
		}
	}
	throw new Error('Unknown type');
};

export const getTypeFromYType = (yType: Y.AbstractType<any>): Type => {
	if (yType instanceof Y.Text) {
		return yType.getAttribute('type') || 'string';
	} else if (yType instanceof Y.Array) {
		return 'array';
	} else if (yType instanceof Y.Map) {
		return 'map';
	}

	throw new Error('Unknown type');
};

export const getTypeFromParent = <T extends Y.Array<any> | Y.Map<any> | Y.Text>({
	parent,
	key,
	validator,
	forceNewType,
	value,
	type
}: {
	parent: Y.Map<any> | Y.Array<any>;
	key: string | number;
	value?: string;
	forceNewType?: boolean;
	validator?: Validator;
	type?: Type;
}): T => {
	const isArray = parent instanceof Y.Array;

	const instance = getInstance(validator?.$schema.kind || type!) as new () =>
		| Y.Array<any>
		| Y.Map<any>
		| Y.Text;
	const isText = instance === Y.Text;
	const typeInParent = (isArray ? parent.get(Number(key)) : parent.get(String(key))) as T;

	const stringifiedValue = validator
		? getInitialStringifiedValueFromValidator(value || typeInParent.toJSON(), validator)
		: getStringifiedValueFromType(value || typeInParent.toJSON(), type);

	// console.log(3, { value, type, typeInParent: typeInParent });
	// In case the state is schemaless
	// store type in yText in order to be know how to parse it later
	const setAndReturnType = () => {
		const yType = isText ? new Y.Text(stringifiedValue) : new instance();
		console.log({ stringifiedValue });
		if (type && yType instanceof Y.Text) {
			yType._pending?.push(() => {
				yType.setAttribute('type', type);
			});
		}
		if (isArray) {
			parent.insert(Number(key), [yType]);
		} else {
			parent.delete(String(key));
			parent.set(String(key), yType);
		}
		return yType as T;
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

export const getInstance = (type: Type): (new () => Y.AbstractType<any>) | null => {
	switch (type) {
		case 'map':
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
	this.state.transaction(() => {
		this.syncroStates.forEach((state) => state.destroy());
		if (this instanceof SyncedSet) {
			this.syncroStatesValues.clear();
		}
		this.syncroStates = [];
		this.isNull = true;
		this.yType.delete(0, this.yType.length);
		this.yType.insert(0, [new Y.Text(NULL_ARRAY)]);
	});
}

export const isArrayNull = ({ yType }: { yType: Y.Array<any> }) => {
	return (
		yType.length === 1 && yType.get(0) instanceof Y.Text && yType.get(0).toString() === NULL_ARRAY
	);
};

export function observeArray(
	this: SyncedArray | SyncedSet,
	e: Y.YArrayEvent<any>,
	_transaction: Y.Transaction
) {
	if (_transaction.origin !== this.state.transactionKey) {
		if (isArrayNull(this)) {
			this.isNull = true;
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
			this.syncroStates
				.map((state) => state.value)
				.forEach((value) => {
					this.syncroStatesValues.add(value);
				});
		}
	}
}
