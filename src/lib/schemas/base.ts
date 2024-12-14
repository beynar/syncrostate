import type { _stringify } from 'valibot';

export type BaseSchema<T> = {
	kind: 'array' | 'object' | 'string' | 'boolean' | 'number' | 'enum' | 'date' | 'richText';
	optional: boolean;
	nullable: boolean;
	default?: T;
};

export class BaseValidator<
	S extends BaseSchema<any>,
	O extends boolean = false,
	N extends boolean = false
> {
	$schema: S;
	validateType(value: any): S extends BaseSchema<infer T> ? T | null : any {
		// @ts-expect-error
		return null;
	}

	// Convert data to string format for display/storage
	stringify = (value: any) => {
		return '';
	};

	//  Convert a string to the correct type.
	coerce(value: any): S extends BaseSchema<infer T> ? T | null : any {
		// @ts-expect-error
		return null;
	}

	// Returns the valid value or null. Ensure data strictly matches your schema
	validate(value: any) {
		if (value === null && !this.$schema.nullable) return null;
		if (value === undefined && !this.$schema.optional) return null;
		return this.validateType(value);
	}
	constructor(schema: S) {
		this.$schema = schema;
	}

	optional() {
		this.$schema.optional = true;
		return this as BaseValidator<S, true, N>;
	}

	nullable() {
		this.$schema.nullable = true;
		return this as BaseValidator<S, O, true>;
	}

	default(value: S extends BaseSchema<infer T> ? T : never) {
		this.$schema.default = value;
		return this as BaseValidator<S, O, N>;
	}
}
