import { type BaseSchema, BaseValidator } from './base.js';
import type { SchemaOutput, Validator } from './schema.js';

export type ObjectShape = {
	[key: string]: Validator;
};
export type ObjectSchema<T extends ObjectShape> = BaseSchema<any> & {
	kind: 'object';
	shape: T;
};

export class ObjectValidator<T extends ObjectShape> {
	$schema: ObjectSchema<T>;
	constructor(shape: T) {
		this.$schema = {
			kind: 'object',
			optional: false,
			nullable: false,
			shape
		};
	}

	validate(value: any): SchemaOutput<T> | null {
		if (typeof value !== 'object' || value === null) return null;
		return value as SchemaOutput<T>;
	}
	coerce(value: any): SchemaOutput<T> | null {
		return this.validate(value);
	}
}
