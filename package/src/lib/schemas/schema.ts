import type { Simplify } from '../types.js';
import { ArrayValidator, type ArraySchema } from './array.js';
import { BaseValidator, type BaseSchema } from './base.js';
import { BooleanValidator, type BooleanSchema } from './boolean.js';
import { DateValidator, type DateSchema } from './date.js';
import { EnumValidator, type EnumSchema } from './enum.js';
import { StringValidator, type StringSchema } from './string.js';
import { ObjectValidator, type ObjectSchema, type ObjectShape } from './object.js';
import { RichTextValidator, type RichTextSchema } from './richtext.js';
import { NumberValidator, type NumberSchema } from './number.js';
import { SetValidator, type SetSchema } from './set.js';
import type { State } from '$lib/proxys/syncroState.svelte.js';
import type { Array as YArray, Map as YMap } from 'yjs';

export type Schema =
	| ArraySchema<any>
	| ObjectSchema<any>
	| BooleanSchema
	| DateSchema
	| StringSchema
	| NumberSchema
	// | RichTextSchema
	| EnumSchema<any>
	| SetSchema<any>;

export type PrimitiveValidator = BaseValidator<Schema, boolean, boolean>;
export type Validator =
	| PrimitiveValidator
	| ArrayValidator<any>
	| ObjectValidator<any>
	| SetValidator<any>;

export const y = {
	boolean: () => new BooleanValidator(),
	date: () => new DateValidator(),
	enum: <T extends string | number>(...values: T[]) => new EnumValidator<T>(...values),
	string: () => new StringValidator(),
	richText: () => new RichTextValidator(),
	object: <T extends ObjectShape>(shape: T) => new ObjectValidator<T>(shape),
	array: <T extends Validator>(shape: T) => new ArrayValidator<T>(shape),
	number: () => new NumberValidator(),
	set: <T extends PrimitiveValidator>(shape: T) => new SetValidator<T>(shape)
};

// I need to add these properties as optional because of typescript.
// Looking for a better solution.
type Getters<T extends 'object' | 'array'> = {
	getState?: () => State;
	getTypes?: () => T extends 'array' ? YArray<any> : YMap<any>;
	getYTypes?: () => T extends 'array' ? YArray<any> : YMap<any>;
};

type NORO<N extends boolean, O extends boolean, T> = N extends true
	? O extends true
		? T | null | undefined
		: T | null
	: O extends true
		? T | undefined
		: T;

type InferSchemaType<T> =
	T extends ObjectValidator<infer Shape, infer O, infer N>
		? NORO<N, O, SchemaOutput<Shape>>
		: T extends BaseValidator<infer S, infer O, infer N>
			? NORO<N, O, S extends BaseSchema<infer T> ? T : never>
			: T extends ArrayValidator<infer Shape>
				? InferSchemaType<Shape>[] & Getters<'array'>
				: T extends SetValidator<infer Shape, infer O, infer N>
					? NORO<N, O, Set<InferSchemaType<Shape>>>
					: never;

export type SchemaOutput<T extends ObjectShape> = Simplify<{
	[K in keyof T]: InferSchemaType<T[K]>;
}> &
	Getters<'object'>;
