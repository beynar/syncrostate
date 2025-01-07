import type { Validator } from './schema.js';
import { isValidNullOrUndefined, type BaseSchema } from './base.js';

export type ArraySchema<T extends Validator> = BaseSchema<ArrayType<T>[]> & {
	kind: 'array';
	shape: T;
	min?: number;
	max?: number;
};

type ArrayType<T extends Validator> = T['$schema'] extends BaseSchema<infer T> ? T : never;

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
	isValidNullOrUndefined = isValidNullOrUndefined.bind(this);

	isValid = (value: any): value is ArrayType<T>[] => {
		if (!Array.isArray(value)) return false;
		if (!this.isValidNullOrUndefined(value)) {
			return false;
		}
		return value.every((item) => this.$schema.shape.isValid(item));
	};

	optional() {
		this.$schema.optional = true;
		return this as ArrayValidator<T, true, N>;
	}

	nullable() {
		this.$schema.nullable = true;
		return this as ArrayValidator<T, O, true>;
	}

	validate(value: any): T[] | null {
		if (typeof value !== 'object' || value === null) return null;
		if (!Array.isArray(value)) return null;
		const isNullable = this.$schema.nullable;
		const allValid = value.every(
			(item) => this.$schema.shape.validate(item) !== null || (isNullable && item === null)
		);
		return allValid ? (value as T[]) : null;
	}

	coerce(value: any): T[] | null {
		return this.validate(value);
	}

	default(value: ArrayType<T>[]) {
		this.$schema.default = value;
		return this as ArrayValidator<T>;
	}
}
