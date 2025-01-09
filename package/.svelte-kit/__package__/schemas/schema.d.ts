import type { Simplify } from '../types.js';
import { ArrayValidator, type ArraySchema } from './array.js';
import { BaseValidator, type BaseSchema } from './base.js';
import { BooleanValidator, type BooleanSchema } from './boolean.js';
import { DateValidator, type DateSchema } from './date.js';
import { EnumValidator, type EnumSchema } from './enum.js';
import { StringValidator, type StringSchema } from './string.js';
import { ObjectValidator, type ObjectSchema, type ObjectShape } from './object.js';
import { RichTextValidator } from './richtext.js';
import { NumberValidator, type NumberSchema } from './number.js';
import type { State } from '../proxys/syncroState.svelte.js';
export type Schema = ArraySchema<any> | ObjectSchema<any> | BooleanSchema | DateSchema | StringSchema | NumberSchema | EnumSchema<any>;
export type Validator = BaseValidator<Schema, boolean, boolean> | ArrayValidator<any> | ObjectValidator<any>;
export declare const y: {
    boolean: () => BooleanValidator<false, false>;
    date: () => DateValidator<false, false>;
    enum: <T extends string | number>(...values: T[]) => EnumValidator<T, false, false>;
    string: () => StringValidator<false, false>;
    richText: () => RichTextValidator<false, false>;
    object: <T extends ObjectShape>(shape: T) => ObjectValidator<T, false, false>;
    array: <T extends Validator>(shape: T) => ArrayValidator<T, false, false>;
    number: () => NumberValidator<false, false>;
};
type NORO<N extends boolean, O extends boolean, T> = N extends true ? O extends true ? T | null | undefined : T | null : O extends true ? T | undefined : T;
type InferSchemaType<T> = T extends ObjectValidator<infer Shape, infer O, infer N> ? NORO<N, O, SchemaOutput<Shape>> : T extends BaseValidator<infer S, infer O, infer N> ? NORO<N, O, S extends BaseSchema<infer T> ? T : never> : T extends ArrayValidator<infer Shape> ? InferSchemaType<Shape>[] & {
    $state: State;
} : never;
export type SchemaOutput<T extends ObjectShape> = Simplify<{
    [K in keyof T]: InferSchemaType<T[K]>;
}> & {
    $state: State;
};
export {};