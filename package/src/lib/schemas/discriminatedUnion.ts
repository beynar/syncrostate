import { type BaseSchema, isValidNullOrUndefined } from './base.js';
import { ObjectValidator, type ObjectShape } from './object.js';
import type { SchemaOutput } from './schema.js';

export type DiscriminatedUnionSchema<
	K extends string,
	T extends ObjectShape[]
> = BaseSchema<any> & {
	kind: 'discriminatedUnion';
	discriminantKey: K;
	variants: T;
	variantValidators: ObjectValidator<any>[];
};

export class DiscriminatedUnionValidator<
	K extends string,
	T extends ObjectShape[],
	O extends boolean = false,
	N extends boolean = false
> {
	$schema: DiscriminatedUnionSchema<K, T>;

	constructor(discriminantKey: K, variants: T) {
		// Convert each variant (plain object shape) to an ObjectValidator
		const variantValidators = variants.map((variant) => {
			const validator = new ObjectValidator(variant);
			if (!(discriminantKey in variant)) {
				throw new Error(
					`All variants must have the discriminant key "${discriminantKey}" in their shape`
				);
			}
			return validator;
		});

		this.$schema = {
			kind: 'discriminatedUnion',
			optional: false,
			nullable: false,
			discriminantKey,
			variants,
			variantValidators
		};
	}

	isValidNullOrUndefined = isValidNullOrUndefined.bind(this);

	// Get the variant that matches the discriminant value
	private getVariantByDiscriminant(discriminantValue: any): ObjectValidator<any> | null {
		for (const variant of this.$schema.variantValidators) {
			const discriminantValidator = variant.$schema.shape[this.$schema.discriminantKey];
			if (discriminantValidator && discriminantValidator.isValid(discriminantValue)) {
				return variant;
			}
		}
		return null;
	}

	isValid = (value: any): boolean => {
		if (value === null) {
			return this.$schema.nullable;
		}
		if (value === undefined) {
			return this.$schema.optional;
		}

		if (typeof value !== 'object' || value === null) {
			return false;
		}

		// Get the discriminant value
		const discriminantValue = value[this.$schema.discriminantKey];
		if (discriminantValue === undefined) {
			return false;
		}

		// Find matching variant
		const matchingVariant = this.getVariantByDiscriminant(discriminantValue);
		if (!matchingVariant) {
			return false;
		}

		// Validate against the matching variant
		return matchingVariant.isValid(value);
	};

	optional() {
		this.$schema.optional = true;
		return this as DiscriminatedUnionValidator<K, T, true, N>;
	}

	nullable() {
		this.$schema.nullable = true;
		return this as DiscriminatedUnionValidator<K, T, O, true>;
	}

	default(value: InferDiscriminatedUnionType<T>) {
		this.$schema.default = value;
		return this as DiscriminatedUnionValidator<K, T, O, N>;
	}

	coerce(value: any): InferDiscriminatedUnionType<T> | null {
		if (value === null || value === undefined) {
			if (this.$schema.nullable && value === null) {
				return null;
			}
			if (this.$schema.optional && value === undefined) {
				return null;
			}
			return this.$schema.default || null;
		}

		if (typeof value !== 'object') {
			return this.$schema.default || null;
		}

		const discriminantValue = value[this.$schema.discriminantKey];
		const matchingVariant = this.getVariantByDiscriminant(discriminantValue);

		if (!matchingVariant) {
			return this.$schema.default || null;
		}

		const coerced = matchingVariant.coerce(value);
		return coerced as InferDiscriminatedUnionType<T>;
	}

	parse(value: any): { isValid: boolean; value: InferDiscriminatedUnionType<T> | null } {
		const coerced = this.coerce(value);
		const isValid = this.isValid(value);
		return {
			isValid,
			value: isValid ? coerced : null
		};
	}
}

// Type inference helper for discriminated unions
export type InferDiscriminatedUnionType<T extends ObjectShape[]> = SchemaOutput<T[number]>;
