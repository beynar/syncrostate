import { type BaseSchema, BaseValidator } from './base.js';
import type { SchemaOutput, Validator } from './schema.js';

export type ObjectShape = {
	[key: string]: Validator;
};
export type ObjectSchema<T extends ObjectShape> = BaseSchema<any> & {
	kind: 'object';
	shape: T;
};

export class ObjectValidator<
	T extends ObjectShape,
	O extends boolean = false,
	N extends boolean = false
> {
	$schema: ObjectSchema<T>;
	constructor(shape: T) {
		this.$schema = {
			kind: 'object',
			optional: false,
			nullable: false,
			shape
		};
	}

	optional() {
		this.$schema.optional = true;
		return this as ObjectValidator<T, true, N>;
	}

	nullable() {
		this.$schema.nullable = true;
		return this as ObjectValidator<T, O, true>;
	}

	validate(value: any): SchemaOutput<T> | null {
		if (typeof value !== 'object' || value === null) return null;
		const allValid = Object.entries(this.$schema.shape).every(([key, validator]) => {
			return validator.validate(value[key]) !== null;
		});
		return allValid ? (value as SchemaOutput<T>) : null;
	}
	coerce(value: any): SchemaOutput<T> | null {
		return this.validate(value);
	}
}
