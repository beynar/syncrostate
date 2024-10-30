import { BaseValidator, type BaseSchema } from './base.js';

type RichText = string;
// type RichText = {
// 	text: string;
// 	marks: {
// 		type: string;
// 		data: Record<string, any>;
// 	}[];
// };

export type RichTextSchema = BaseSchema<RichText> & {
	kind: 'richText';
};

export class RichTextValidator<
	O extends boolean = false,
	N extends boolean = false
> extends BaseValidator<RichTextSchema, O, N> {
	constructor() {
		super({ kind: 'richText', optional: false, nullable: false });
	}

	validate(value: any): RichText | null {
		if (typeof value !== 'string') return null;
		return value;
	}

	coerce(value: any): string | null {
		const DEFAULT_VALUE = this.$schema.default ?? null;
		return this.validate(value) ?? DEFAULT_VALUE;
	}
	stringify = (value: any) => {
		return this.coerce(value)?.toString() ?? '';
	};
}
