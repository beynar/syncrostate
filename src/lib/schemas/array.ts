import type { Schema, Validator } from './schema.js';
import { type BaseSchema, BaseValidator } from './base.js';

export type ArraySchema<T extends Validator> = BaseSchema<T['$schema']['kind'][]> & {
	kind: 'array';
	shape: T;
	min?: number;
	max?: number;
};

export class ArrayValidator<
	T extends Validator,
	O extends boolean = false,
	N extends boolean = false
> {
	$schema: ArraySchema<T>;
	constructor(shape: T) {
		this.$schema = {
			kind: 'array',
			optional: false,
			nullable: false,
			shape
		};
	}

	optional() {
		this.$schema.optional = true;
		return this as ArrayValidator<T, true, N>;
	}

	nullable() {
		this.$schema.nullable = true;
		return this as ArrayValidator<T, O, true>;
	}

	min(length: number) {
		this.$schema.min = length;
		return this as ArrayValidator<T>;
	}

	max(length: number) {
		this.$schema.max = length;
		return this as ArrayValidator<T>;
	}

	validate(value: any): T[] | null {
		if (typeof value !== 'object' || value === null) return null;
		return value as T[];
	}

	coerce(value: any): T[] | null {
		return this.validate(value);
	}

	default(value: T['$schema']['kind'][]) {
		this.$schema.default = value;
		return this as ArrayValidator<T>;
	}
}
