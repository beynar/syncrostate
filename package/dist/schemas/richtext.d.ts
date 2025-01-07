import { BaseValidator, type BaseSchema } from './base.js';
type RichText = string;
export type RichTextSchema = BaseSchema<RichText> & {
    kind: 'richText';
};
export declare class RichTextValidator<O extends boolean = false, N extends boolean = false> extends BaseValidator<RichTextSchema, O, N> {
    constructor();
    validate(value: any): RichText | null;
    coerce(value: any): string | null;
    stringify: (value: any) => string;
}
export {};
