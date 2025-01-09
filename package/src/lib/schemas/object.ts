import { type BaseSchema, isValidNullOrUndefined } from './base.js';
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
	isValidNullOrUndefined = isValidNullOrUndefined.bind(this);

	isValid = (value: any): value is SchemaOutput<T> => {
		if (value === null) {
			return this.$schema.nullable;
		}
		if (value === undefined) {
			return this.$schema.optional;
		}

		if (typeof value === 'object') {
			return Object.entries(this.$schema.shape).every(([key, validator]) => {
				return validator.isValid(value[key]);
			});
		}

		return false;
	};

	optional() {
		this.$schema.optional = true;
		return this as ObjectValidator<T, true, N>;
	}

	nullable() {
		this.$schema.nullable = true;
		return this as ObjectValidator<T, O, true>;
	}

	default(value: SchemaOutput<T>) {
		this.$schema.default = value;
		return this as ObjectValidator<T>;
	}

	coerce(value: any): SchemaOutput<T> | null {
		const isObject = typeof value === 'object' && value !== null;
		if (!isObject) {
			return null;
		}
		return Object.entries(this.$schema.shape).reduce((acc, [key, validator]) => {
			Object.assign(acc, { [key]: validator.coerce(value[key]) });
			return acc;
		}, {} as SchemaOutput<T>);
	}

	parse(value: any): { isValid: boolean; value: SchemaOutput<T> | null } {
		const coerced = this.coerce(value);
		const isValid = this.isValid(value);
		return {
			isValid,
			value: isValid ? coerced : null
		};
	}
}
