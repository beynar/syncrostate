import { NULL } from '../constants.js';
import { BaseValidator, type BaseSchema } from './base.js';

export type EnumSchema<T extends string | number> = BaseSchema<T> & {
	kind: 'enum';
	values: Set<T>;
};

export class EnumValidator<
	T extends string | number,
	O extends boolean = false,
	N extends boolean = false
> extends BaseValidator<EnumSchema<T>, O, N> {
	constructor(...values: T[]) {
		super({ kind: 'enum', optional: false, nullable: false, values: new Set(values) });
	}

	isValid = (value: any) => {
		if (!this.isValidNullOrUndefined(value)) {
			return false;
		}
		return this.$schema.values.has(value);
	};

	parse(value: string | null): { isValid: boolean; value: T | null } {
		const coerced = this.coerce(value);
		return {
			isValid: this.isValid(coerced),
			value: coerced
		};
	}

	coerce(value: string | null): T | null {
		if (value === NULL || value === null) return null;
		if (this.$schema.values.has(value as any)) return value as T;
		return null;
	}
	stringify = (value: any) => {
		if (value === null) return NULL;
		return this.coerce(value)?.toString() ?? '';
	};
}
