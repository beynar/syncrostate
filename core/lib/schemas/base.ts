export type BaseSchema<T> = {
	kind:
		| 'array'
		| 'object'
		| 'string'
		| 'boolean'
		| 'number'
		| 'enum'
		| 'date'
		| 'richText'
		| 'set'
		| 'map'
		| 'literal'
		| 'discriminatedUnion';
	optional: boolean;
	nullable: boolean;
	default?: T;
};

export function isValidNullOrUndefined(this: { $schema: BaseSchema<any> }, value: any) {
	const isOptionnal = this.$schema.optional;
	const isNullable = this.$schema.nullable;
	const isOkNullable = value === null && isNullable;
	const isOkUndefined = value === undefined && isOptionnal;
	if (isOkNullable || isOkUndefined) {
		return true;
	}

	return true;
}

export class BaseValidator<
	S extends BaseSchema<any>,
	O extends boolean = false,
	N extends boolean = false
> {
	$schema: S;
	isValid = (value: any) => {
		//
	};

	isValidNullOrUndefined = isValidNullOrUndefined.bind(this);

	// Convert data to string format for display/storage
	stringify = (value: any) => {
		return '';
	};

	//  Convert a string to the correct type.
	coerce(value: any): S extends BaseSchema<infer T> ? T | null : any {
		// @ts-expect-error
		return null;
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
