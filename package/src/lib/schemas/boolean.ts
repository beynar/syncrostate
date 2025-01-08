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

	private get defaultValue(): boolean | null {
		return this.$schema.default || null;
	}

	isValid = (value: any) => {
		if (typeof value === 'boolean') {
			return true;
		}
		if (value === null) {
			return this.$schema.nullable;
		}
		if (value === undefined) {
			return this.$schema.optional;
		}

		return false;
	};

	parse(value: string | null): { isValid: boolean; value: boolean | null } {
		const coerced = this.coerce(value);
		return {
			isValid: this.isValid(coerced),
			value: coerced
		};
	}

	coerce(value: string | null): boolean | null {
		if (value === NULL || value === null) {
			if (this.$schema.nullable) {
				return null;
			} else {
				return this.defaultValue;
			}
		}
		if (value === 'true') return true;
		if (value === 'false') return false;

		return this.$schema.nullable ? null : this.defaultValue;
	}

	stringify = (value: any) => {
		if (typeof value === 'boolean') {
			return value ? 'true' : 'false';
		} else {
			if (this.$schema.nullable) {
				return NULL;
			} else {
				return this.defaultValue === null ? NULL : this.defaultValue ? 'true' : 'false';
			}
		}
	};
}
