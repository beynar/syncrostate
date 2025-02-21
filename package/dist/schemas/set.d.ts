import { type BaseSchema } from './base.js';
import type { PrimitiveValidator } from './schema.js';
type SetType<T extends PrimitiveValidator> = T['$schema'] extends BaseSchema<infer T> ? T : never;
export type SetSchema<T extends PrimitiveValidator> = BaseSchema<Set<SetType<T>>> & {
    kind: 'set';
    shape: T;
};
export declare class SetValidator<T extends PrimitiveValidator, O extends boolean = false, N extends boolean = false> {
    $schema: SetSchema<T>;
    constructor(shape: T);
    optional(): SetValidator<T, true, N>;
    nullable(): SetValidator<T, O, true>;
    default(value: Set<SetType<T>> | SetType<T>[]): SetValidator<T, O, N>;
    isValid: (value: any) => value is Set<SetType<T>>;
    coerce(value: any): Set<SetType<T>> | null;
    parse(value: any): {
        isValid: boolean;
        value: Set<SetType<T>> | null;
    };
}
export {};
