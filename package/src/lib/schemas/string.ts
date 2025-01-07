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

	isValid = (value: any) => {
		if (!this.isValidNullOrUndefined(value)) {
			return false;
		}
		if (typeof value !== 'string') return false;
		if (this.$schema.min && value.length < this.$schema.min) return false;
		if (this.$schema.max && value.length > this.$schema.max) return false;
		if (this.$schema.pattern && !this.$schema.pattern.test(value)) return false;
		return true;
	};

	parse(value: string): { isValid: boolean; value: string | null } {
		const coerced = this.coerce(value);
		return {
			isValid: this.isValid(coerced),
			value: coerced
		};
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

	coerce(value: string): string | null {
		if (value === NULL) return null;
		return value;
	}

	stringify = (value: any) => {
		if (value === null) return NULL;
		return this.coerce(value)?.toString() ?? '';
	};
}
