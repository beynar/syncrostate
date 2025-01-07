import { BaseValidator, type BaseSchema } from './base.js';
export type NumberSchema = BaseSchema<number> & {
    kind: 'number';
};
export declare class NumberValidator<O extends boolean = false, N extends boolean = false> extends BaseValidator<NumberSchema, O, N> {
    constructor();
    isValid: (value: any) => boolean;
    parse(value: string | null): {
        isValid: boolean;
        value: number | null;
    };
    coerce(value: string | null): number | null;
    stringify: (value: any) => string;
}
