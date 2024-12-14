import * as Y from 'yjs';
import { toJSON } from '$lib/toJSON.js';
import type { ObjectShape, ObjectValidator } from '$lib/schemas/object.js';
import type { Integrator } from '$lib/integrator.js';
import type { Validator } from '$lib/schemas/schema.js';
import { getInstance } from '$lib/utils.js';
import type { ArrayValidator } from '$lib/schemas/array.js';

const observeArray =
	({
		path,
		validator,
		yType,
		integrator
	}: {
		path: string;
		validator: ArrayValidator<any>;
		yType: Y.Array<any>;
		integrator: Integrator;
	}) =>
	(e: Y.YArrayEvent<any>, transaction: Y.Transaction) => {
		e.changes?.keys.forEach(({ action }, key) => {
			if (action === 'delete') {
				console.log(action);
			}
		});
	};

export class SyncedArray {
	integrator: Integrator;
	validator: ArrayValidator<any>;
	path: string;
	yType: Y.Array<any>;
	value: any;
	observe: (e: Y.YArrayEvent<any>, transaction: Y.Transaction) => void;
	constructor({
		integrator,
		validator,
		path,
		yType
	}: {
		integrator: Integrator;
		validator: ArrayValidator<any>;
		path: string;
		yType: Y.Array<any>;
	}) {
		this.integrator = integrator;
		this.validator = validator;
		this.path = path;
		this.yType = yType;
	}
}
