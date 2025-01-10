import { BaseValidator, type BaseSchema } from './base.js';
import type { PrimitiveValidator } from './schema.js';

type SetType<T extends PrimitiveValidator> = T['$schema'] extends BaseSchema<infer T> ? T : never;

export type SetSchema<T extends PrimitiveValidator> = BaseSchema<Set<SetType<T>>> & {
	kind: 'set';
	shape: T;
};

export class SetValidator<
	T extends PrimitiveValidator,
	O extends boolean = false,
	N extends boolean = false
> {
	$schema: SetSchema<T>;
	constructor(shape: T) {
		this.$schema = {
			kind: 'set',
			optional: false,
			nullable: false,
			shape
		};
	}

	optional() {
		this.$schema.optional = true;
		return this as SetValidator<T, true, N>;
	}

	nullable() {
		this.$schema.nullable = true;
		return this as SetValidator<T, O, true>;
	}

	default(value: Set<SetType<T>> | SetType<T>[]) {
		if (value instanceof Set) {
			this.$schema.default = value;
		} else {
			this.$schema.default = new Set(value);
		}
		return this as SetValidator<T, O, true>;
	}

	isValid = (value: any): value is Set<SetType<T>> => {
		if (value instanceof Set) {
			return Array.from(value).every((item) => this.$schema.shape.isValid(item));
		}

		if (value === null) {
			return this.$schema.nullable;
		}

		if (value === undefined) {
			return this.$schema.optional;
		}

		return false;
	};

	coerce(value: any): Set<SetType<T>> | null {
		if (value instanceof Set) {
			const validItems = Array.from(value).filter((item) => this.$schema.shape.isValid(item));
			if (validItems.length > 0) {
				return new Set(validItems);
			}
		}

		if (value === null && this.$schema.nullable) {
			return null;
		}

		return this.$schema.default || new Set();
	}

	parse(value: any): { isValid: boolean; value: Set<SetType<T>> | null } {
		const coerced = this.coerce(value);
		return {
			isValid: this.isValid(value),
			value: coerced
		};
	}
}
