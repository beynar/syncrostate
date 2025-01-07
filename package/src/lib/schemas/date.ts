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

	isValid = (value: any) => {
		if (!this.isValidNullOrUndefined(value)) {
			return false;
		}
		if (typeof value === 'string' && !this.isStringADate(value)) {
			return false;
		}
		return true;
	};

	parse(value: string | null): { isValid: boolean; value: Date | null } {
		const coerced = this.coerce(value);
		return {
			isValid: this.isValid(coerced),
			value: coerced
		};
	}
	coerce(value: string | null): Date | null {
		if (value === NULL || value === null) return null;
		if (this.isStringADate(value)) {
			return new Date(value);
		}
		if (
			Number.isInteger(Number(value)) &&
			!isNaN(Number(value)) &&
			!isNaN(new Date(Number(value)).getTime())
		) {
			return new Date(Number(value));
		}
		return null;
	}
	stringify = (value: any) => {
		return this.coerce(value)?.toISOString() ?? '';
	};
}
