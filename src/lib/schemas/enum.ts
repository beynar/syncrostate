import { NULL } from '$lib/constants.js';
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

	validate(value: any): T | null {
		if (this.$schema.values.has(value)) return value;
		return null;
	}

	coerce(value: any): T | null {
		if (value === NULL) return null;
		const DEFAULT_VALUE = this.$schema.default ?? null;
		return this.validate(value) ?? DEFAULT_VALUE;
	}
	stringify = (value: any) => {
		if (value === null) return NULL;
		return this.coerce(value)?.toString() ?? '';
	};
}
