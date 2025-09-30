import { NULL } from '../constants.js';
import { BaseValidator, type BaseSchema } from './base.js';

export type LiteralSchema<T extends string | number | boolean> = BaseSchema<T> & {
	kind: 'literal';
	value: T;
};

export class LiteralValidator<
	T extends string | number | boolean,
	O extends boolean = false,
	N extends boolean = false
> extends BaseValidator<LiteralSchema<T>, O, N> {
	constructor(value: T) {
		super({ kind: 'literal', optional: false, nullable: false, value });
	}

	private get defaultValue(): T | null {
		return this.$schema.default || this.$schema.value;
	}

	isValid = (value: any): value is T => {
		if (value === this.$schema.value) {
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

	parse(value: any): { isValid: boolean; value: T | null } {
		const isValid = this.isValid(value);
		return {
			isValid,
			value: isValid ? this.coerce(value) : null
		};
	}

	coerce(value: any): T | null {
		if (value === NULL || value === null) {
			if (this.$schema.nullable) {
				return null;
			} else {
				return this.defaultValue;
			}
		}
		if (value === undefined) {
			if (this.$schema.optional) {
				return null;
			}
			return this.$schema.nullable ? null : this.defaultValue;
		}
		if (value === this.$schema.value) {
			return value as T;
		}
		return this.$schema.nullable ? null : this.defaultValue;
	}

	stringify = (value: any) => {
		if (value === null) return NULL;
		if (value === this.$schema.value) return value.toString();
		return this.defaultValue?.toString() ?? NULL;
	};
}
