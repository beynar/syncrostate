import { type BaseSchema } from './base.js';
import type { SchemaOutput, Validator } from './schema.js';
export type ObjectShape = {
    [key: string]: Validator;
};
export type ObjectSchema<T extends ObjectShape> = BaseSchema<any> & {
    kind: 'object';
    shape: T;
};
export declare class ObjectValidator<T extends ObjectShape, O extends boolean = false, N extends boolean = false> {
    $schema: ObjectSchema<T>;
    constructor(shape: T);
    isValidNullOrUndefined: (value: any) => boolean;
    isValid: (value: any) => value is SchemaOutput<T>;
    optional(): ObjectValidator<T, true, N>;
    nullable(): ObjectValidator<T, O, true>;
    validate(value: any): SchemaOutput<T> | null;
    coerce(value: any): SchemaOutput<T> | null;
}
