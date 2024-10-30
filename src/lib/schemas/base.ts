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
	stringify = (value: any) => {
		return '';
	};
}
