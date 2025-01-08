import { NULL } from '$lib/constants.js';
import { BaseValidator, type BaseSchema } from './base.js';

export type DateSchema = BaseSchema<Date> & {
	kind: 'date';
	min?: Date;
	max?: Date;
};

export class DateValidator<
	O extends boolean = false,
	N extends boolean = false
> extends BaseValidator<DateSchema, O, N> {
	constructor() {
		super({ kind: 'date', optional: false, nullable: false });
	}

	min(date: Date) {
		this.$schema.min = date;
		return this as DateValidator<O, N>;
	}

	max(date: Date) {
		this.$schema.max = date;
		return this as DateValidator<O, N>;
	}
	private isStringADate(value: string): boolean {
		try {
			return !isNaN(new Date(value).getTime());
		} catch (error) {
			return false;
		}
	}

	private get defaultValue(): Date | null {
		return this.$schema.default || null;
	}

	isValid = (value: any): boolean => {
		if (value instanceof Date) {
			if (this.$schema.min && value < this.$schema.min) {
				return false;
			}
			if (this.$schema.max && value > this.$schema.max) {
				return false;
			}
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

	parse(value: string | null): { isValid: boolean; value: Date | null } {
		const coerced = this.coerce(value);
		return {
			isValid: this.isValid(coerced),
			value: coerced
		};
	}
	coerce(value: string | null): Date | null {
		if (value === NULL || value === null || value === undefined) {
			if (this.$schema.nullable) {
				return null;
			} else {
				return this.defaultValue;
			}
		}

		if (value === undefined) {
			return this.$schema.optional ? null : this.defaultValue;
		}

		if (this.isStringADate(value)) {
			return new Date(value);
		}

		return this.$schema.nullable ? null : this.defaultValue;
	}
	stringify = (value: any): string => {
		if (value instanceof Date) {
			return value.toISOString();
		} else {
			if (this.$schema.nullable) {
				return NULL;
			} else {
				return this.defaultValue?.toISOString() || NULL;
			}
		}
	};
}
