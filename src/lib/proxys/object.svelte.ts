import * as Y from 'yjs';
import { toJSON } from '$lib/toJSON.js';
import type { ObjectShape, ObjectValidator } from '$lib/schemas/object.js';
import type { Integrator } from '$lib/integrator.js';
import type { Validator } from '$lib/schemas/schema.js';
import { getInstance } from '$lib/utils.js';

export const observeObject =
	({
		path,
		validator,
		yType,
		integrator
	}: {
		path: string;
		validator: ObjectValidator<any>;
		yType: Y.Map<any>;
		integrator: Integrator;
	}) =>
	(e: Y.YMapEvent<any>, transaction: Y.Transaction) => {
		e.changes?.keys.forEach(({ action }, key) => {
			if (action === 'delete') {
				integrator.remove(path ? `${path}.${key}` : key);
			} else if (action === 'add') {
				// If a new key is added to the object and is valid, integrate it
				const instance = getInstance(key, validator.$schema.shape);
				if (instance) {
					integrator.syncType({
						path,
						key,
						instance,
						validator: validator.$schema.shape[key] as Validator,
						parent: yType
					});
				}
			}
		});
	};

export class SyncedObject {
	integrator: Integrator;
	validator: ObjectValidator<any>;
	path: string;
	yType: Y.Map<any>;
	value: any;
	observe: (e: Y.YMapEvent<any>, transaction: Y.Transaction) => void;
	constructor({
		integrator,
		validator,
		path,
		yType
	}: {
		integrator: Integrator;
		validator: ObjectValidator<any>;
		path: string;
		yType: Y.Map<any>;
	}) {
		this.integrator = integrator;
		this.validator = validator;
		this.path = path;
		this.yType = yType;
		this.value = new Proxy({}, objectHandler(validator.$schema.shape, path, yType, integrator));
		this.observe = observeObject(this);
		yType.observe(this.observe);
	}

	destroy() {
		this.yType.unobserve(this.observe);
	}
}

export const objectHandler = (
	shape: ObjectShape,
	path: string,
	yType: Y.Map<any>,
	integrator: Integrator
) => {
	return {
		get(target: any, p: any) {
			const newPath = path ? `${path}.${p}` : p;

			if (p[0] === '$') {
				return Reflect.get(target, p);
			}

			if (p === 'toJSON') {
				return toJSON(newPath, yType, integrator.syncedStates);
			}

			const syncedState = integrator.syncedStates.get(newPath);

			if (!syncedState) {
				return undefined;
			}
			return syncedState.state.value;
		},
		set(target: any, key: any, value: any) {
			const newPath = path ? `${path}.${key}` : key;
			if (value === undefined) {
				return this.deleteProperty(target, key);
			}
			const syncedState = integrator.syncedStates.get(newPath);
			if (!syncedState) {
				const validator = shape[key];
				if (validator) {
					integrator.integrateType({
						path,
						key,
						value,
						validator,
						parent: yType
					});
				}
			} else if (syncedState.type instanceof Y.Text) {
				syncedState.state.value = value;
			} else if (syncedState.type instanceof Y.Map) {
				integrator.integrateObject({
					path,
					key,
					validator: syncedState.validator as ObjectValidator<any>,
					parent: yType,
					value,
					cleanUp: true
				});
			}

			return true;
		},

		deleteProperty: (target: any, p: any) => {
			console.log('deleteProperty', p);
			if (typeof p !== 'string') {
				console.error('p must be a string');
				return true;
			}
			const newPath = path ? `${path}.${p}` : p;
			const syncedState = integrator.syncedStates.get(newPath);
			if (!syncedState) {
				console.error('Property does not exist', newPath);
				return true;
			} else if (!syncedState.validator.$schema.optional) {
				console.error('Can not delete non optional property', newPath);
				return true;
			}

			integrator.remove(newPath);

			return true;
		},

		has: (target: any, key: any) => {
			if (typeof key !== 'string') {
				console.error('key must be a string');
				return false;
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
