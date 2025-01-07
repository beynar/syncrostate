import { BaseValidator, type BaseSchema } from './base.js';
export type EnumSchema<T extends string | number> = BaseSchema<T> & {
    kind: 'enum';
    values: Set<T>;
};
export declare class EnumValidator<T extends string | number, O extends boolean = false, N extends boolean = false> extends BaseValidator<EnumSchema<T>, O, N> {
    constructor(...values: T[]);
    isValid: (value: any) => boolean;
    parse(value: string | null): {
        isValid: boolean;
        value: T | null;
    };
    coerce(value: string | null): T | null;
    stringify: (value: any) => string;
}
