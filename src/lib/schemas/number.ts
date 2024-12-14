import { NULL } from '$lib/constants.js';
import { BaseValidator, type BaseSchema } from './base.js';

export type NumberSchema = BaseSchema<number> & {
	kind: 'number';
};

export class NumberValidator<
	O extends boolean = false,
	N extends boolean = false
> extends BaseValidator<NumberSchema, O, N> {
	constructor() {
		super({ kind: 'number', optional: false, nullable: false });
	}

	validateType(value: any): number | null {
		if (typeof value !== 'number' || isNaN(Number(value))) return null;
		return value;
	}

	coerce(value: any): number | null {
		if (value === NULL) return null;
		const DEFAULT_VALUE = this.$schema.default ?? null;
		const parsed = Number(value);
		if ((!value || isNaN(parsed)) && parsed !== 0) return DEFAULT_VALUE;
		return parsed;
	}
	stringify = (value: any) => {
		if (value === null) return NULL;
		return this.coerce(value) ? String(value) : '';
	};
}
