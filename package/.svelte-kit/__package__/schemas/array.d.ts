import type { Validator } from './schema.js';
import { type BaseSchema } from './base.js';
export type ArraySchema<T extends Validator> = BaseSchema<ArrayType<T>[]> & {
    kind: 'array';
    shape: T;
    min?: number;
    max?: number;
};
type ArrayType<T extends Validator> = T['$schema'] extends BaseSchema<infer T> ? T : never;
export declare class ArrayValidator<T extends Validator, O extends boolean = false, N extends boolean = false> {
    $schema: ArraySchema<T>;
    constructor(shape: T);
    isValidNullOrUndefined: (value: any) => boolean;
    isValid: (value: any) => value is ArrayType<T>[];
    optional(): ArrayValidator<T, true, N>;
    nullable(): ArrayValidator<T, O, true>;
    validate(value: any): T[] | null;
    coerce(value: any): T[] | null;
    default(value: ArrayType<T>[]): ArrayValidator<T>;
}
export {};
