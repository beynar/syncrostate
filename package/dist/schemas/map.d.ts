import { type BaseSchema } from './base.js';
import type { InferSchemaType, Validator } from './schema.js';
export type MapSchema<T extends Validator> = BaseSchema<any> & {
    kind: 'map';
    shape: T;
};
export declare class MapValidator<T extends Validator, O extends boolean = false, N extends boolean = false> {
    $schema: MapSchema<T>;
    constructor(shape: T);
    isValidNullOrUndefined: (value: any) => boolean;
    isValid: (value: any) => boolean;
    optional(): MapValidator<T, true, N>;
    nullable(): MapValidator<T, O, true>;
    default(value: InferSchemaType<T> | Map<string, InferSchemaType<T>>): MapValidator<T, O, N>;
    coerce(value: any): Map<string, InferSchemaType<T>> | null;
    parse(value: any): {
        isValid: boolean;
        value: Map<string, InferSchemaType<T>> | null;
    };
}
