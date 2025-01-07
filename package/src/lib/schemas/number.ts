import { NULL } from '../constants.js';
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

	isValid = (value: any) => {
		if (!this.isValidNullOrUndefined(value)) {
			return false;
		}
		return typeof value === 'number' && !isNaN(Number(value));
	};

	parse(value: string | null): { isValid: boolean; value: number | null } {
		const coerced = this.coerce(value);
		return {
			isValid: this.isValid(coerced),
			value: coerced
		};
	}

	coerce(value: string | null): number | null {
		if (value === NULL || value === null) return null;
		const parsed = Number(value);
		return parsed;
	}
	stringify = (value: any) => {
		if (value === null) return NULL;
		return this.coerce(value) ? String(value) : '';
	};
}
