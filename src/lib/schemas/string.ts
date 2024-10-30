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

	validate(value: any): string | null {
		if (typeof value !== 'string') return null;
		if (this.$schema.min && value.length < this.$schema.min) return null;
		if (this.$schema.max && value.length > this.$schema.max) return null;
		if (this.$schema.pattern && !this.$schema.pattern.test(value)) return null;
		return value;
	}

	coerce(value: any): string | null {
		const DEFAULT_VALUE = this.$schema.default ?? null;
		return this.validate(value) ?? DEFAULT_VALUE;
	}

	stringify = (value: any) => {
		return this.coerce(value)?.toString() ?? '';
	};
}
