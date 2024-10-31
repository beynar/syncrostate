import * as Y from 'yjs';
import { toJSON } from '$lib/toJSON.js';
import { traverseShape } from '$lib/schemas/traverse.js';
import type { ObjectShape, ObjectValidator } from '$lib/schemas/object.js';
import type { SyncedCache } from './syncedCache.svelte.js';

export class SyncedObject {
	syncedCache: SyncedCache;
	validator: ObjectValidator<any>;
	path: string;
	yType: Y.Map<any>;
	value: any;
	constructor({
		syncedCache,
		validator,
		path,
		yType
	}: {
		syncedCache: SyncedCache;
		validator: ObjectValidator<any>;
		path: string;
		yType: Y.Map<any>;
	}) {
		this.syncedCache = syncedCache;
		this.validator = validator;
		this.path = path;
		this.yType = yType;
		this.value = new Proxy({}, objectHandler(validator.$schema.shape, path, yType, syncedCache));
		yType.observe(this.observe);
	}

	destroy() {
		this.yType.unobserve(this.observe);
	}

	getPath(key: string) {
		return this.path ? `${this.path}.${key}` : key;
	}

	observe = (e: Y.YMapEvent<any>, transaction: Y.Transaction) => {
		console.log('observe', e);
		e.changes?.keys.forEach(({ action }, key) => {
			if (action === 'delete') {
				this.syncedCache.remove(this.getPath(key));
			} else if (action === 'add') {
				this.syncedCache.integrate({
					path: this.getPath(key),
					type: e.target.get(key),
					validator: this.validator,
					isRoot: true
				});
			}
		});
	};
}

export const objectHandler = (
	shape: ObjectShape,
	path: string,
	yType: Y.Map<any>,
	syncedCache: SyncedCache
) => {
	return {
		get(target: any, p: any) {
			if (typeof p !== 'string') {
				return Reflect.get(target, p);
			}
			const newPath = path ? `${path}.${p}` : p;
			if (p[0] === '$') {
				return Reflect.get(target, p);
			}
			if (p === 'toJSON') {
				return toJSON(newPath, yType, syncedCache.syncedStates);
			}

			const syncedState = syncedCache.syncedStates.get(newPath);

			if (!syncedState) {
				return undefined;
			}
			return syncedState.state?.value;
		},
		set(target: any, key: any, value: any) {
			if (typeof key !== 'string') {
				throw new Error('key must be a string');
			}

			const newPath = path ? `${path}.${key}` : key;
			const syncedState = syncedCache.syncedStates.get(newPath);

			if (!syncedState) {
				const validator = shape[key];
				if (validator) {
					traverseShape({
						parent: yType,
						shape: {
							[key]: validator
						},
						follower: {
							[key]: value
						},
						syncedCache
					});
				}
				return true;
			}

			if (syncedState.type instanceof Y.Text) {
				syncedState.state!.value = value;
			}

			if (syncedState.type instanceof Y.Map) {
				const newSyncedPaths = new Set<string>();
				const previousSyncedPaths = new Set<string>(
					Array.from(syncedCache.syncedStates.keys()).filter((p) => p.startsWith(path))
				);
				traverseShape({
					shape: syncedState.validator.$schema.shape,
					follower: syncedState.validator.$schema.default,
					enforceDefault: true,
					parent: syncedState.type,
					syncedCache,
					onType: (p) => {
						newSyncedPaths.add(p);
					}
				});

				previousSyncedPaths.difference(newSyncedPaths).forEach((p) => {
					syncedCache.remove(p);
				});
			}
			return true;
		},

		deleteProperty: (target: any, p: any) => {
			if (typeof p !== 'string') {
				throw new Error('p must be a string');
			}
			const newPath = path ? `${path}.${p}` : p;
			const syncedState = syncedCache.syncedStates.get(newPath);
			if (!syncedState) {
				console.error('Property does not exist', newPath);
				return true;
			}
			if (!syncedState.validator.$schema.optional) {
				console.error('Can not delete non optional property', newPath);
				return true;
			}
			syncedCache.remove(newPath);

			return true;
		},

		has: (target: any, key: any) => {
			if (typeof key !== 'string') {
				throw new Error('key must be a string');
			}
			return yType.has(key);
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

		ownKeys: () => Array.from(yType.keys())
	};
};
