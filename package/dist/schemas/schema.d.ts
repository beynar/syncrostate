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
import { SetValidator, type SetSchema } from './set.js';
import type { State } from '../proxys/syncroState.svelte.js';
import type { Array as YArray, Map as YMap, AbstractType, Text as YText } from 'yjs';
import { MapValidator, type MapSchema } from './map.js';
export type Schema = ArraySchema<any> | ObjectSchema<any> | BooleanSchema | DateSchema | StringSchema | NumberSchema | EnumSchema<any> | SetSchema<any> | MapSchema<any>;
export type PrimitiveValidator = BaseValidator<Schema, boolean, boolean>;
export type Validator = PrimitiveValidator | ArrayValidator<any> | ObjectValidator<any> | SetValidator<any> | MapValidator<any>;
export declare const y: {
    boolean: () => BooleanValidator<false, false>;
    date: () => DateValidator<false, false>;
    enum: <T extends string | number>(...values: T[]) => EnumValidator<T, false, false>;
    string: () => StringValidator<false, false>;
    richText: () => RichTextValidator<false, false>;
    object: <T extends ObjectShape>(shape: T) => ObjectValidator<T, false, false>;
    array: <T extends Validator>(shape: T) => ArrayValidator<T, false, false>;
    number: () => NumberValidator<false, false>;
    set: <T extends PrimitiveValidator>(shape: T) => SetValidator<T, false, false>;
    map: <T extends Validator>(shape: T) => MapValidator<T, false, false>;
};
type Optional<T, N extends boolean = false> = N extends true ? T | undefined : T;
type InferYTypeFromShape<Shape extends Validator | ObjectShape> = Shape extends ObjectShape ? {
    [K in keyof Shape]: Optional<InferYTypeFromShape<Shape[K]>, Shape[K]['$schema']['optional']>;
} : Shape extends ArrayValidator<any> ? YArray<any> : Shape extends ObjectValidator<any> ? YMap<any> : Shape extends SetValidator<any> ? YArray<any> : Shape extends MapValidator<any> ? YMap<any> : YText;
type Getters<T extends 'object' | 'array' | 'map', Shape extends Validator | ObjectShape> = {
    getState?: () => State;
    getYTypes?: () => T extends 'array' ? AbstractType<any>[] : T extends 'map' ? Record<string, InferYTypeFromShape<Shape>> : InferYTypeFromShape<Shape>;
    getYType?: () => T extends 'array' ? YArray<any> : YMap<any>;
};
type NORO<N extends boolean, O extends boolean, T> = N extends true ? O extends true ? T | null | undefined : T | null : O extends true ? T | undefined : T;
export type InferSchemaType<T> = T extends ObjectValidator<infer Shape, infer O, infer N> ? NORO<N, O, SchemaOutput<Shape>> : T extends BaseValidator<infer S, infer O, infer N> ? NORO<N, O, S extends BaseSchema<infer T> ? T : never> : T extends ArrayValidator<infer Shape> ? InferSchemaType<Shape>[] & Getters<'array', Shape> : T extends SetValidator<infer Shape, infer O, infer N> ? NORO<N, O, Set<InferSchemaType<Shape>>> & Getters<'array', Shape> : T extends MapValidator<infer Shape, infer O, infer N> ? NORO<N, O, Map<string, InferSchemaType<Shape>>> & Getters<'map', Shape> : never;
export type SchemaOutput<T extends ObjectShape> = Simplify<{
    [K in keyof T]: InferSchemaType<T[K]>;
}> & Getters<'object', T>;
export {};
