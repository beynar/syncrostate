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
		return !isNaN(new Date(value).getTime());
	}

	validateType(value: any): Date | null {
		if (value instanceof Date) return value;
		if (typeof value === 'string') {
			if (!this.isStringADate(value)) return null;
			return new Date(value);
		}
		return null;
	}

	coerce(value: any): Date | null {
		const DEFAULT_VALUE = this.$schema.default ?? null;
		return value
			? !this.isStringADate(value)
				? DEFAULT_VALUE
				: new Date(value === '0' ? 0 : value)
			: DEFAULT_VALUE;
	}
	stringify = (value: any) => {
		return this.coerce(value)?.toISOString() ?? '';
	};
}
