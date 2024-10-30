import type { Simplify } from '$lib/types.js';
import { ArrayValidator, type ArraySchema } from './array.js';
import { BaseValidator, type BaseSchema } from './base.js';
import { BooleanValidator, type BooleanSchema } from './boolean.js';
import { DateValidator, type DateSchema } from './date.js';
import { EnumValidator, type EnumSchema } from './enum.js';
import { StringValidator, type StringSchema } from './string.js';

import { ObjectValidator, type ObjectSchema, type ObjectShape } from './object.js';
import { RichTextValidator, type RichTextSchema } from './richtext.js';

export type Schema =
	| ArraySchema<any>
	| ObjectSchema<any>
	| BooleanSchema
	| DateSchema
	| StringSchema
	| RichTextSchema
	| EnumSchema<any>;

export type Validator =
	| BaseValidator<Schema, boolean, boolean>
	| ArrayValidator<any>
	| ObjectValidator<any>;

export const y = {
	boolean: () => new BooleanValidator(),
	date: () => new DateValidator(),
	enum: <T extends string | number>(...values: T[]) => new EnumValidator<T>(...values),
	string: () => new StringValidator(),
	richText: () => new RichTextValidator(),
	object: <T extends ObjectShape>(shape: T) => new ObjectValidator<T>(shape),
	array: <T extends Validator>(shape: T) => new ArrayValidator<T>(shape)
};

type NORO<N extends boolean, O extends boolean, T> = N extends true
	? O extends true
		? T | null | undefined
		: T | null
	: O extends true
		? T | undefined
		: T;

type InferSchemaType<T> =
	T extends BaseValidator<infer S, infer O, infer N>
		? NORO<N, O, S extends BaseSchema<infer T> ? T : never>
		: T extends ArrayValidator<infer Shape>
			? InferSchemaType<Shape>[]
			: T extends ObjectValidator<infer Shape>
				? SchemaOutput<Shape>
				: never;

export type SchemaOutput<T extends ObjectShape> = Simplify<{
	[K in keyof T]: InferSchemaType<T[K]>;
}>;

const schemaTest = {
	a: y.string().optional(),
	b: y.object({
		c: y.string()
	}),
	e: y.enum('a', 'b', 'c'),
	f: y.array(y.string().nullable())
};

const test = y.string().nullable();
type OK = typeof test extends Schema ? true : false;
type Test = SchemaOutput<typeof schemaTest>;

type C = Test['b'];
