import { type BaseSchema, isValidNullOrUndefined } from './base.js';
import type { InferSchemaType, SchemaOutput, Validator } from './schema.js';

export type MapSchema<T extends Validator> = BaseSchema<any> & {
	kind: 'map';
	shape: T;
};

export class MapValidator<
	T extends Validator,
	O extends boolean = false,
	N extends boolean = false
> {
	$schema: MapSchema<T>;
	constructor(shape: T) {
		this.$schema = {
			kind: 'map',
			optional: false,
			nullable: false,
			shape
		};
	}
	isValidNullOrUndefined = isValidNullOrUndefined.bind(this);

	isValid = (value: any): boolean => {
		if (value instanceof Map) {
			return Array.from(value.values()).every((val) => {
				return this.$schema.shape.isValid(val);
			});
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
		return this as MapValidator<T, true, N>;
	}

	nullable() {
		this.$schema.nullable = true;
		return this as MapValidator<T, O, true>;
	}

	default(value: InferSchemaType<T> | Map<string, InferSchemaType<T>>) {
		if (value instanceof Map) {
			this.$schema.default = value;
		} else {
			this.$schema.default = new Map(Object.entries(value));
		}
		return this as MapValidator<T, O, N>;
	}

	coerce(value: any): Map<string, InferSchemaType<T>> | null {
		if (value instanceof Map) {
			const entries = Array.from(value.entries()).filter(([key, value]) =>
				this.$schema.shape.isValid(value)
			);
			if (entries.length > 0) {
				return new Map(entries);
			}
		}

		if (value === null && this.$schema.nullable) {
			return null;
		}

		return this.$schema.default || new Set();
	}

	parse(value: any): { isValid: boolean; value: Map<string, InferSchemaType<T>> | null } {
		return {
			isValid: this.isValid(value),
			value: this.coerce(value)
		};
	}
}
