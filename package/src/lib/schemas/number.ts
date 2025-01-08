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

	private get defaultValue(): number | null {
		return this.$schema.default || null;
	}

	isValid = (value: any) => {
		if (typeof value === 'number' && !isNaN(value)) {
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

	parse(value: string | null): { isValid: boolean; value: number | null } {
		const coerced = this.coerce(value);
		return {
			isValid: this.isValid(coerced),
			value: coerced
		};
	}

	coerce(value: string | null): number | null {
		if (value === NULL || value === null) {
			if (this.$schema.nullable) {
				return null;
			} else {
				return this.defaultValue;
			}
		}
		if (value === undefined) {
			return this.$schema.optional ? null : this.defaultValue;
		}

		const parsed = Number(value);
		if (isNaN(parsed)) {
			return this.$schema.nullable ? null : this.defaultValue;
		}

		return parsed;
	}
	stringify = (value: any) => {
		if (typeof value === 'number') {
			return String(value);
		} else {
			if (this.$schema.nullable) {
				return NULL;
			} else {
				return this.defaultValue?.toString() || NULL;
			}
		}
	};
}
