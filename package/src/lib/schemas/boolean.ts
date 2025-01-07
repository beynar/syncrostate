import { NULL } from '../constants.js';
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

	isValid = (value: any) => {
		if (!this.isValidNullOrUndefined(value)) {
			return false;
		}
		if (typeof value !== 'boolean') return false;
		return true;
	};

	parse(value: string | null): { isValid: boolean; value: boolean | null } {
		const coerced = this.coerce(value);
		return {
			isValid: this.isValid(coerced),
			value: coerced
		};
	}

	coerce(value: string | null): boolean | null {
		if (value === 'true') return true;
		if (value === 'false') return false;
		if (value === NULL || value === null) return null;
		if (Number(value) === 1) return true;
		if (Number(value) === 0) return false;
		return null;
	}
	stringify = (value: any) => {
		if (value === null) return NULL;
		const coercedValue = this.coerce(value);
		return coercedValue ? String(coercedValue) : '';
	};
}
