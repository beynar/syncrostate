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

	private get defaultValue() {
		return this.$schema.default || null;
	}

	isValid = (value: any): value is ArrayType<T>[] => {
		if (Array.isArray(value)) {
			return value.every((item) => this.$schema.shape.isValid(item));
		}

		if (value === null) {
			return this.$schema.nullable;
		}

		if (value === undefined) {
			return this.$schema.optional;
		}

		return false;
	};

	optional() {
		this.$schema.optional = true;
		return this as ArrayValidator<T, true, N>;
	}

	nullable() {
		this.$schema.nullable = true;
		return this as ArrayValidator<T, O, true>;
	}

	coerce(value: any): ArrayType<T>[] | null {
		const isArray = Array.isArray(value);
		const validItems = isArray ? value.filter((item) => this.$schema.shape.isValid(item)) : [];
		const someValid = validItems.length > 0;

		if (isArray && someValid) {
			return validItems.map((item) => this.$schema.shape.coerce(item));
		}
		return this.defaultValue;
	}

	parse(value: any): { isValid: boolean; value: ArrayType<T>[] | null } {
		const coerced = this.coerce(value);
		return {
			isValid: this.isValid(coerced),
			value: coerced
		};
	}

	default(value: ArrayType<T>[]) {
		this.$schema.default = value;
		return this as ArrayValidator<T>;
	}
}
