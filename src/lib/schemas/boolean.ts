import { NULL } from '$lib/constants.js';
import { BaseValidator, type BaseSchema } from './base.js';

export type BooleanSchema = BaseSchema<boolean> & {
	kind: 'boolean';
};

export class BooleanValidator<
	O extends boolean = false,
	N extends boolean = false
> extends BaseValidator<BooleanSchema, O, N> {
	constructor() {
		super({ kind: 'boolean', optional: false, nullable: false });
	}

	validateType(value: any): boolean | null {
		if (typeof value !== 'boolean') return null;
		return value;
	}

	coerce(value: any): boolean | null {
		if (value === 'true') return true;
		if (value === 'false') return false;
		if (value === NULL) return null;
		const DEFAULT_VALUE = this.$schema.default ?? null;
		if (value === null || value === undefined) return DEFAULT_VALUE;
		if (typeof value === 'boolean') return value;
		if (Number(value) === 1) return true;
		if (Number(value) === 0) return false;
		if (typeof value === 'string') {
			return value.toLowerCase() === 'true'
				? true
				: value.toLowerCase() === 'false'
					? false
					: DEFAULT_VALUE;
		}

		return DEFAULT_VALUE;
	}
	stringify = (value: any) => {
		if (value === null) return NULL;
		const coercedValue = this.coerce(value);
		const validValue = this.validate(coercedValue);
		return validValue ? String(coercedValue) : '';
	};
}
