import { BaseValidator, type BaseSchema } from './base.js';
export type BooleanSchema = BaseSchema<boolean> & {
    kind: 'boolean';
};
export declare class BooleanValidator<O extends boolean = false, N extends boolean = false> extends BaseValidator<BooleanSchema, O, N> {
    constructor();
    isValid: (value: any) => boolean;
    parse(value: string | null): {
        isValid: boolean;
        value: boolean | null;
    };
    coerce(value: string | null): boolean | null;
    stringify: (value: any) => string;
}
