import type { Validator } from '$lib/schemas/schema.js';
import { SvelteMap } from 'svelte/reactivity';
import * as Y from 'yjs';
import type { ObjectShape, ObjectValidator } from '$lib/schemas/object.js';
import type { BaseValidator } from '$lib/schemas/base.js';
import { SyncedEnum } from './proxys/enum.svelte.js';
import { SyncedDate } from './proxys/date.svelte.js';
import { SyncedBoolean } from './proxys/boolean.svelte.js';
import type { StringValidator } from '$lib/schemas/string.js';
import type { NumberValidator } from '$lib/schemas/number.js';
import type { EnumValidator } from '$lib/schemas/enum.js';
import type { DateValidator } from '$lib/schemas/date.js';
import type { BooleanValidator } from '$lib/schemas/boolean.js';
import { SyncedText } from './proxys/text.svelte.js';
import { SyncedNumber } from './proxys/number.svelte.js';
import { SyncedObject } from './proxys/object.svelte.js';
import {
	applyDefaultOrValue,
	findArrayPaths,
	getTypeFromParent,
	isMissingOptionnal
} from './utils.js';

export type SyncedState =
	| {
			type: Y.Map<any>;
			validator: ObjectValidator<any>;
			state: SyncedObject;
	  }
	| {
			type: Y.Text;
			validator: BaseValidator<any>;
			state: SyncedText | SyncedNumber | SyncedDate | SyncedEnum<any> | SyncedBoolean;
	  };
export type SyncedStates = Integrator['syncedStates'];

export class Integrator {
	syncedStates = new SvelteMap<string, SyncedState>();

	destroy = () => {
		this.syncedStates.clear();
	};

	remove = (path: string) => {
		const syncedState = this.syncedStates.get(path);
		if (syncedState) {
			const key = path.split('.').at(-1)!;
			syncedState.state?.destroy?.();
			this.syncedStates.delete(path);

			const parent = syncedState.type.parent;
			if (parent instanceof Y.Array) {
				parent.delete(Number(key));
				findArrayPaths(this.syncedStates.keys(), path).forEach((p) => {
					this.remove(p);
				});
			} else if (parent instanceof Y.Map) {
				parent.delete(key);
				this.syncedStates.forEach((_, p) => {
					if (p.startsWith(path)) {
						this.remove(p);
					}
				});
			}
		}
	};

	syncType = <T extends Y.AbstractType<any>>({
		path,
		key,
		parent,
		instance,
		validator
	}: {
		parent: Y.Map<any> | Y.Array<any>;
		path: string;
		key: string | number;
		instance: new () => T;
		value?: any;
		validator: Validator;
	}) => {
		const type = getTypeFromParent({ parent, key, instance });
		const newPath = path ? `${path}.${key}` : `${key}`;
		const previousSyncedState = this.syncedStates.get(newPath);
		const shouldCreate = (instance: any) => {
			// Only create a new synced state if it doesn't exist yet
			const isCorrectlySync =
				!previousSyncedState || !(previousSyncedState.state instanceof instance);

			if (isCorrectlySync) {
				previousSyncedState?.state?.destroy?.();
			}

			return isCorrectlySync;
		};

		if (type instanceof Y.Text) {
			switch (validator.$schema.kind) {
				case 'string': {
					if (shouldCreate(SyncedText)) {
						this.syncedStates.set(newPath, {
							type,
							validator: validator as StringValidator,
							state: new SyncedText(type, validator as StringValidator)
						});
					}
					break;
				}
				case 'number': {
					if (shouldCreate(SyncedNumber)) {
						if (previousSyncedState) {
							previousSyncedState.state?.destroy?.();
						}
						this.syncedStates.set(newPath, {
							type,
							validator: validator as NumberValidator,
							state: new SyncedNumber(type, validator as NumberValidator)
						});
					}
					break;
				}
				case 'boolean': {
					if (shouldCreate(SyncedBoolean)) {
						this.syncedStates.set(newPath, {
							type,
							validator: validator as BooleanValidator,
							state: new SyncedBoolean(type, validator as BooleanValidator)
						});
					}
					break;
				}
				case 'date': {
					if (shouldCreate(SyncedDate)) {
						this.syncedStates.set(newPath, {
							type,
							validator: validator as DateValidator,
							state: new SyncedDate(type, validator as DateValidator)
						});
					}
					break;
				}
				case 'enum': {
					if (shouldCreate(SyncedEnum)) {
						this.syncedStates.set(newPath, {
							type,
							validator: validator as EnumValidator<any, any, any>,
							state: new SyncedEnum(type, validator as EnumValidator<any, any, any>)
						});
					}
					break;
				}
			}
		} else if (type instanceof Y.Map) {
			if (shouldCreate(SyncedObject)) {
				const _validator = validator as ObjectValidator<any>;
				this.syncedStates.set(newPath, {
					type: type as Y.Map<any>,
					validator: _validator,
					state: new SyncedObject({
						yType: type,
						path: newPath,
						integrator: this,
						validator: _validator
					})
				});
			}
		}

		return type;
	};

	integrateType = ({
		validator,
		key,
		path,
		parent,
		cleanUp,
		value
	}: {
		validator: Validator;
		key: string;
		path: string;
		parent: Y.Map<any> | Y.Array<any>;
		cleanUp?: boolean;
		value?: any;
	}) => {
		// const isDocInitialized = doc.getText(INITIALIZED).toString() === INITIALIZED;
		const newPath = path ? `${path}.${key}` : `${key}`;
		switch (validator.$schema.kind) {
			case 'richText':
			case 'boolean':
			case 'date':
			case 'number':
			case 'string':
			case 'enum': {
				if (isMissingOptionnal({ validator, parent, key }) && !value) {
					break;
				}

				const yText = this.syncType({
					path,
					key,
					validator,
					instance: Y.Text,
					parent
				});

				applyDefaultOrValue(value, validator as BaseValidator<any, false, false>, yText);

				break;
			}
			case 'array': {
				const yArray = this.syncType({
					path,
					key,
					instance: Y.Array,
					validator,
					parent
				});
				// onType?.(newPath, yArray);
				const arrayValidator = validator.$schema.shape as Validator;

				if (!yArray.length) {
					// TODO handle optional / nullable or default here
				} else {
					for (let i = 0; ; i++) {
						const arrayPath = `${newPath}.${i}`;
						const arrayType = yArray.get(i);
						const arrayValue = value?.[i];

						if (!arrayType) {
							// TODO handle optional / nullable or default here
							break;
						}
						switch (arrayValidator.$schema.kind) {
							case 'richText':
							case 'boolean':
							case 'date':
							case 'string':
							case 'enum': {
								const yText = this.syncType({
									path: arrayPath,
									key: i,
									validator: arrayValidator,
									instance: Y.Text,
									parent: yArray
								});
								applyDefaultOrValue(
									arrayValue,
									validator as BaseValidator<any, false, false>,
									yText
								);

								// onType?.(arrayPath, yText);
								break;
							}

							case 'object': {
								this.integrateObject({
									cleanUp,
									validator: arrayValidator as ObjectValidator<any>,
									path: arrayPath,
									value: arrayValue,
									parent: yArray,
									key: i
								});
								break;
							}

							case 'array': {
								// Not implemented
								break;
							}
						}
					}
				}
				break;
			}

			case 'object': {
				// Do not integrate if the value is missing from the parent and the property is optional and no value is provided (meaning it is not a "set").
				if (isMissingOptionnal({ validator, parent, key }) && !value) {
					break;
				}

				this.integrateObject({
					cleanUp,
					validator: validator as ObjectValidator<any>,
					path,
					value: value?.[key],
					parent,
					key
				});

				break;
			}
		}
	};

	integrateObject = ({
		validator,
		path,
		parent,
		key,
		value,
		cleanUp
	}: {
		validator: ObjectValidator<any>;
		path: string;
		parent: Y.Map<any> | Y.Array<any> | Y.Doc;
		key: string | number;
		value?: any;
		cleanUp?: boolean;
	}) => {
		const newPath = path ? `${path}.${key}` : `${key}`;
		const newSyncedPaths = new Set<string>();
		const previousSyncedPaths = new Set<string>(
			cleanUp
				? Array.from(this.syncedStates.keys()).filter((p) => {
						const length = p.split('.').length;
						const pathLength = newPath.split('.').length;
						return length === pathLength + 1 && p.startsWith(newPath);
					})
				: undefined
		);

		const yObject =
			parent instanceof Y.Doc
				? parent.getMap('$state')
				: this.syncType({
						path,
						key,
						validator,
						instance: Y.Map,
						parent
					});

		(Object.entries(validator.$schema.shape) as [string, Validator][]).forEach(
			([key, validator]) => {
				if (cleanUp) {
					newSyncedPaths.add(newPath + '.' + key);
				}

				this.integrateType({
					validator,
					value: value?.[key],
					cleanUp,
					key,
					path: newPath,
					parent: yObject
				});
			}
		);
		if (cleanUp) {
			previousSyncedPaths.difference(newSyncedPaths).forEach((p) => {
				this.remove(p);
			});
		}
	};
}
