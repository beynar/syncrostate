import type { ObjectShape } from './object.js';
import * as Y from 'yjs';
import type { Validator } from './schema.js';
import type { BaseValidator } from './base.js';
import { INITIALIZED } from '$lib/constants.js';
import type { SyncedCache } from '$lib/proxys/syncedCache.svelte.js';

// REMINDER OF THE MENTAL MODEL
// This function MUST be executed after the offline => remote synchronisation
// Otherwise, the local changes will be lost and any other peer will have their changes overwritten

const getTypeFromParent = <T extends Y.AbstractType<any>>(
	parent: Y.Map<any> | Y.Array<any>,
	key: any,
	instance: new () => T
): T => {
	const isArray = parent instanceof Y.Array;
	const type = new instance();
	const typeInParent = (isArray ? parent.get(Number(key)) : parent.get(key)) as T;

	const setAndReturnType = () => {
		if (isArray) {
			parent.delete(Number(key));
			parent.insert(Number(key), [type]);
		} else {
			parent.delete(key);
			parent.set(key, type);
		}
		return type as T;
	};
	if (!typeInParent || typeInParent._item?.deleted) {
		return setAndReturnType() as T;
	}
	if (!(typeInParent instanceof instance)) {
		return setAndReturnType() as T;
	} else {
		return typeInParent as T;
	}
};

export const traverseShape = ({
	shape,
	enforceDefault = false,
	follower,
	path = '',
	parent,
	syncedCache,
	onType
}: {
	shape: ObjectShape;
	enforceDefault?: boolean;
	parent: Y.Map<any>;
	path?: string;
	follower?: any;
	syncedCache: SyncedCache;
	onType?: (path: string, type: Y.AbstractType<any>) => void;
}) => {
	// const isDocInitialized = doc.getText(INITIALIZED).toString() === INITIALIZED;
	const isRoot = parent instanceof Y.Doc;
	const validate = (key: string, newPath: string, validator: Validator, parent: Y.Map<any>) => {
		switch (validator.$schema.kind) {
			case 'richText':
			case 'boolean':
			case 'date':
			case 'number':
			case 'string':
			case 'enum': {
				const yText = getTypeFromParent(parent, key, Y.Text);
				const DEFAULT_VALUE = follower?.[key] || validator.$schema.default;
				if (DEFAULT_VALUE && (!yText.length || enforceDefault)) {
					yText.applyDelta([
						{ insert: (validator as BaseValidator<any, false, false>).stringify(DEFAULT_VALUE) }
					]);
				}

				syncedCache.integrate({
					path: newPath,
					validator,
					type: yText,
					isRoot
				});
				onType?.(newPath, yText);

				break;
			}
			case 'array': {
				const yArray = getTypeFromParent(parent, key, Y.Array);
				syncedCache.integrate({
					path: newPath,
					validator,
					type: yArray,
					isRoot
				});
				onType?.(newPath, yArray);
				const arrayValidator = validator.$schema.shape as Validator;

				if (!yArray.length) {
					// TODO handle optional / nullable or default here
				} else {
					for (let i = 0; ; i++) {
						const arrayPath = `${newPath}.${i}`;
						const value = yArray.get(i);

						if (!value) {
							// TODO handle optional / nullable or default here
							break;
						}
						switch (arrayValidator.$schema.kind) {
							case 'richText':
							case 'boolean':
							case 'date':
							case 'string':
							case 'enum': {
								const yText = getTypeFromParent(yArray, i, Y.Text);
								syncedCache.integrate({
									path: arrayPath,
									validator: arrayValidator,
									type: yText
								});
								onType?.(arrayPath, yText);
								break;
							}
							case 'object': {
								const yObject = getTypeFromParent(yArray, i, Y.Map);

								syncedCache.integrate({
									path: arrayPath,
									validator: arrayValidator,
									type: yObject
								});
								onType?.(arrayPath, yObject);
								traverseShape({
									shape: arrayValidator.$schema.shape as ObjectShape,
									path: arrayPath,
									follower: follower?.[key]?.[i],
									onType,
									parent: yObject,
									syncedCache
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
				// TODO implement default / nullable / optionnal safety
				// yType.insert(0, validator.$schema.default || '');
				const yObject = getTypeFromParent(parent, key, Y.Map);
				syncedCache.integrate({ path: newPath, type: yObject, validator, isRoot });
				onType?.(newPath, yObject);
				traverseShape({
					shape: validator.$schema.shape as ObjectShape,
					path: newPath,
					parent: yObject,
					follower: follower?.[key] || validator.$schema.default,
					enforceDefault,
					onType,
					syncedCache
				});
				break;
			}
		}
	};

	for (const [key, validator] of Object.entries(shape)) {
		validate(key, path ? `${path}.${key}` : key, validator, parent);
	}

	// if (!isDocInitialized && isRoot) {
	// 	const initializedText = doc.getText(INITIALIZED);
	// 	const length = initializedText.length;
	// 	initializedText.applyDelta(
	// 		length ? [{ delete: length }, { insert: INITIALIZED }] : [{ insert: INITIALIZED }]
	// 	);
	// }
	// return doc;
};
