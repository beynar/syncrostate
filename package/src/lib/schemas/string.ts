import { NULL } from '../constants.js';
import { BaseValidator, type BaseSchema } from './base.js';

export type StringSchema = BaseSchema<string> & {
	kind: 'string';
	min?: number;
	max?: number;
	pattern?: RegExp;
};

export class StringValidator<
	O extends boolean = false,
	N extends boolean = false
> extends BaseValidator<StringSchema, O, N> {
	constructor() {
		super({ kind: 'string', optional: false, nullable: false });
	}

	private get defaultValue(): string | null {
		return this.$schema.default || null;
	}

	min(length: number) {
		this.$schema.min = length;
		return this as StringValidator<O, N>;
	}

	max(length: number) {
		this.$schema.max = length;
		return this as StringValidator<O, N>;
	}

	pattern(regex: RegExp) {
		this.$schema.pattern = regex;
		return this as StringValidator<O, N>;
	}

	isValid = (value: any) => {
		if (typeof value === 'string') {
			if (this.$schema.min && value.length < this.$schema.min) return false;
			if (this.$schema.max && value.length > this.$schema.max) return false;
			if (this.$schema.pattern && !this.$schema.pattern.test(value)) return false;
			return true;
		}
		if (value === NULL || value === null) {
			return this.$schema.nullable;
		}
		if (value === undefined) {
			return this.$schema.optional;
		}
		return false;
	};

	parse(value: string): { isValid: boolean; value: string | null } {
		const coerced = this.coerce(value);
		return {
			isValid: this.isValid(coerced),
			value: coerced
		};
	}

	coerce(value: string): string | null {
		if (value === NULL || value === null) {
			if (this.$schema.nullable) {
				return null;
			} else {
				return this.defaultValue;
			}
		}
		if (value === undefined) {
			// TODO maybe we should return undefined instead of null
			return this.$schema.nullable ? null : this.defaultValue;
		}

		if (typeof value === 'string') {
			return value;
		}
		return this.$schema.nullable ? null : this.defaultValue;
	}

	stringify = (value: any) => {
		if (typeof value === 'string') {
			return value;
		} else {
			if (this.$schema.nullable) {
				return NULL;
			} else {
				return this.defaultValue || NULL;
			}
		}
	};
}
