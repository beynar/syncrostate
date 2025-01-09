import { BaseValidator, type BaseSchema } from './base.js';
export type StringSchema = BaseSchema<string> & {
    kind: 'string';
    min?: number;
    max?: number;
    pattern?: RegExp;
};
export declare class StringValidator<O extends boolean = false, N extends boolean = false> extends BaseValidator<StringSchema, O, N> {
    constructor();
    private get defaultValue();
    min(length: number): StringValidator<O, N>;
    max(length: number): StringValidator<O, N>;
    pattern(regex: RegExp): StringValidator<O, N>;
    isValid: (value: any) => boolean;
    parse(value: string | null): {
        isValid: boolean;
        value: string | null;
    };
    coerce(value: string | null): string | null;
    stringify: (value: any) => string;
}
