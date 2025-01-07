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
		if (!this.isValidNullOrUndefined(value)) {
			return false;
		}
		return Object.entries(value).every(([key, value]) => {
			const validator = this.$schema.shape[key];
			if (!validator) return false;
			return validator.isValid(value);
		});
	};

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
		let allValid = true;
		const validValue = Object.entries(this.$schema.shape).reduce((acc, [key, validator]) => {
			const parsedValue = validator.validate(value[key]);
			const valid =
				(validator.$schema.optional && value[key] === undefined) ||
				(validator.$schema.nullable && value[key] === null);
			allValid = allValid && valid;
			Object.assign(acc, { [key]: valid ? parsedValue : undefined });
			return acc;
		}, {});
		console.log({ validValue, allValid });
		return allValid ? (validValue as SchemaOutput<T>) : null;
	}
	coerce(value: any): SchemaOutput<T> | null {
		return this.validate(value);
	}
}
