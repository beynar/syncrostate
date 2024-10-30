import { XmlText } from 'yjs';
import type { Simplify } from './types.js';

type BaseSchema<T> = {
	_optional: boolean;
	_nullable: boolean;
	_default?: T;
};

export type StringSchema = BaseSchema<string> & {
	_kind: 'string';
	_min?: number;
	_max?: number;
	_pattern?: RegExp;
};

export type BooleanSchema = BaseSchema<boolean> & {
	_kind: 'boolean';
};

export type DateSchema = BaseSchema<Date> & {
	_kind: 'date';
	_min?: Date;
	_max?: Date;
};

export type EmailSchema = BaseSchema<string> & {
	_kind: 'email';
};

export type UrlSchema = BaseSchema<URL> & {
	_kind: 'url';
};

export type MapSchema<K, V> = BaseSchema<Map<K, V>> & {
	_kind: 'map';
	_keyType: ObjectShape;
	_valueType: ObjectShape;
};

export type SetSchema<T> = BaseSchema<Set<T>> & {
	_kind: 'set';
	_valueType: ObjectShape;
};

export type EnumSchema<T extends string | number> = BaseSchema<T> & {
	_kind: 'enum';
	_values: readonly T[];
};

export type XmlFragmentSchema = BaseSchema<string> & {
	_kind: 'xmlFragment';
};

export type XmlElementSchema = BaseSchema<string> & {
	_kind: 'xmlElement';
	_tag: string;
};

export type XmlTextSchema = BaseSchema<string> & {
	_kind: 'xmlText';
};

export type ArraySchema<T> = BaseSchema<T[]> & {
	_kind: 'array';
	_itemType: ObjectShape;
	_min?: number;
	_max?: number;
};

type ObjectShape = {
	[key: string]: Schema;
};
export type ObjectSchema = BaseSchema<Record<string, any>> & {
	_kind: 'object';
	_shape: ObjectShape;
};

// First, let's modify how we handle Schema builders
type SchemaBuilder<T> = {
	build(): T;
	optional(): SchemaBuilder<T>;
	nullable(): SchemaBuilder<T>;
};

// Then update our inference types

// Update Schema type to use SchemaBuilder
export type Schema =
	| SchemaBuilder<StringSchema>
	| SchemaBuilder<BooleanSchema>
	| SchemaBuilder<DateSchema>
	| SchemaBuilder<EmailSchema>
	| SchemaBuilder<UrlSchema>
	| SchemaBuilder<MapSchema<any, any>>
	| SchemaBuilder<SetSchema<any>>
	| SchemaBuilder<EnumSchema<any>>
	| SchemaBuilder<XmlFragmentSchema>
	| SchemaBuilder<XmlElementSchema>
	| SchemaBuilder<XmlTextSchema>
	| SchemaBuilder<ArraySchema<any>>
	| SchemaBuilder<ObjectSchema>;

class StringSchemaBuilder<O extends boolean = false, N extends boolean = false> {
	 StringSchema = {
		_kind: 'string',
		_optional: false,
		_nullable: false
	};

	optional() {
		this.schema._optional = true;
		return this as StringSchemaBuilder<true, N>;
	}

	nullable() {
		this.schema._nullable = true;
		return this as StringSchemaBuilder<O, true>;
	}

	default(value: string) {
		this.schema._default = value;
		return this as StringSchemaBuilder<O, N>;
	}

	min(length: number) {
		this.schema._min = length;
		return this as StringSchemaBuilder<O, N>;
	}

	max(length: number) {
		this.schema._max = length;
		return this as StringSchemaBuilder<O, N>;
	}

	pattern(regex: RegExp) {
		this.schema._pattern = regex;
		return this as StringSchemaBuilder<O, N>;
	}

	build(): StringSchema {
		return this.schema;
	}
}

class BooleanSchemaBuilder {
	 BooleanSchema = {
		_kind: 'boolean',
		_optional: false,
		_nullable: false
	};

	optional() {
		this.schema._optional = true;
		return this;
	}

	nullable() {
		this.schema._nullable = true;
		return this;
	}

	default(value: boolean) {
		this.schema._default = value;
		return this;
	}

	build() {
		return this.schema;
	}
}

class DateSchemaBuilder {
	 DateSchema = {
		_kind: 'date',
		_optional: false,
		_nullable: false
	};

	optional() {
		this.schema._optional = true;
		return this;
	}

	nullable() {
		this.schema._nullable = true;
		return this;
	}

	default(value: Date) {
		this.schema._default = value;
		return this;
	}

	min(date: Date) {
		this.schema._min = date;
		return this;
	}

	max(date: Date) {
		this.schema._max = date;
		return this;
	}

	build() {
		return this.schema;
	}
}

class EmailSchemaBuilder {
	 EmailSchema = {
		_kind: 'email',
		_optional: false,
		_nullable: false
	};

	optional() {
		this.schema._optional = true;
		return this;
	}

	nullable() {
		this.schema._nullable = true;
		return this;
	}

	default(value: string) {
		this.schema._default = value;
		return this;
	}

	build() {
		return this.schema;
	}
}

class UrlSchemaBuilder {
	 UrlSchema = {
		_kind: 'url',
		_optional: false,
		_nullable: false
	};

	optional() {
		this.schema._optional = true;
		return this;
	}

	nullable() {
		this.schema._nullable = true;
		return this;
	}

	default(value: string | URL) {
		if (typeof value === 'string') {
			this.schema._default = new URL(value);
		} else {
			this.schema._default = value;
		}
		return this;
	}

	build() {
		return this.schema;
	}
}

class MapSchemaBuilder<K, V> {
	 MapSchema<K, V> = {
		_kind: 'map',
		_optional: false,
		_nullable: false,
		_keyType: {} as ObjectShape,
		_valueType: {} as ObjectShape
	};

	constructor(keyType: ObjectShape, valueType: ObjectShape) {
		this.schema._keyType = keyType;
		this.schema._valueType = valueType;
	}

	optional() {
		this.schema._optional = true;
		return this;
	}

	nullable() {
		this.schema._nullable = true;
		return this;
	}

	default(value: Map<K, V>) {
		this.schema._default = value;
		return this;
	}

	build() {
		return this.schema;
	}
}

class SetSchemaBuilder<T> {
	 SetSchema<T> = {
		_kind: 'set',
		_optional: false,
		_nullable: false,
		_valueType: {} as ObjectShape
	};

	constructor(valueType: ObjectShape) {
		this.schema._valueType = valueType;
	}

	optional() {
		this.schema._optional = true;
		return this;
	}

	nullable() {
		this.schema._nullable = true;
		return this;
	}

	default(value: Set<T>) {
		this.schema._default = value;
		return this;
	}

	build() {
		return this.schema;
	}
}

class EnumSchemaBuilder<T extends string | number> {
	 EnumSchema<T> = {
		_kind: 'enum',
		_optional: false,
		_nullable: false,
		_values: [] as readonly T[]
	};

	constructor(values: readonly T[]) {
		this.schema._values = values;
	}

	optional() {
		this.schema._optional = true;
		return this;
	}

	nullable() {
		this.schema._nullable = true;
		return this;
	}

	default(value: T) {
		this.schema._default = value;
		return this;
	}

	build() {
		return this.schema;
	}
}

class XmlFragmentSchemaBuilder {
	 XmlFragmentSchema = {
		_kind: 'xmlFragment',
		_optional: false,
		_nullable: false
	};

	optional() {
		this.schema._optional = true;
		return this;
	}

	nullable() {
		this.schema._nullable = true;
		return this;
	}

	default(value: string) {
		this.schema._default = value;
		return this;
	}

	build() {
		return this.schema;
	}
}

class XmlElementSchemaBuilder {
	 XmlElementSchema = {
		_kind: 'xmlElement',
		_optional: false,
		_nullable: false,
		_tag: ''
	};

	constructor(tag: string) {
		this.schema._tag = tag;
	}

	optional() {
		this.schema._optional = true;
		return this;
	}

	nullable() {
		this.schema._nullable = true;
		return this;
	}

	default(value: string) {
		this.schema._default = value;
		return this;
	}

	build() {
		return this.schema;
	}
}

class XmlTextSchemaBuilder {
	 XmlTextSchema = {
		_kind: 'xmlText',
		_optional: false,
		_nullable: false
	};

	optional() {
		this.schema._optional = true;
		return this;
	}

	nullable() {
		this.schema._nullable = true;
		return this;
	}

	default(value: string) {
		this.schema._default = value;
		return this;
	}

	build() {
		return this.schema;
	}
}

class ArraySchemaBuilder<T extends { [key: string]: Schema }> {
	 ArraySchema<T> = {
		_kind: 'array',
		_optional: false,
		_nullable: false,
		_itemType: {} as ObjectShape
	};

	constructor(itemType: ObjectShape) {
		this.schema._itemType = itemType;
	}

	optional() {
		this.schema._optional = true;
		return this;
	}

	nullable() {
		this.schema._nullable = true;
		return this;
	}

	default(value: T[]) {
		this.schema._default = value;
		return this;
	}

	min(length: number) {
		this.schema._min = length;
		return this;
	}

	max(length: number) {
		this.schema._max = length;
		return this;
	}

	build() {
		return this.schema;
	}
}

class ObjectSchemaBuilder<T extends { [key: string]: Schema }> {
	 ObjectSchema = {
		_kind: 'object',
		_optional: false,
		_nullable: false,
		_shape: {} as T
	};

	constructor(shape: T) {
		this.schema._shape = shape;
	}

	optional() {
		this.schema._optional = true;
		return this;
	}

	nullable() {
		this.schema._nullable = true;
		return this;
	}

	default(value: Record<string, any>) {
		this.schema._default = value;
		return this;
	}

	build() {
		return this.schema;
	}
}

export const y = {
	string: () => new StringSchemaBuilder(),
	boolean: () => new BooleanSchemaBuilder(),
	date: () => new DateSchemaBuilder(),
	email: () => new EmailSchemaBuilder(),
	url: () => new UrlSchemaBuilder(),
	map: <K, V>(keyType: ObjectShape, valueType: ObjectShape) =>
		new MapSchemaBuilder<K, V>(keyType, valueType),
	set: <T>(valueType: ObjectShape) => new SetSchemaBuilder<T>(valueType),
	enum: <T extends string | number>(values: readonly T[]) => new EnumSchemaBuilder<T>(values),
	xmlFragment: () => new XmlFragmentSchemaBuilder(),
	xmlElement: (tag: string) => new XmlElementSchemaBuilder(tag),
	xmlText: () => new XmlTextSchemaBuilder(),
	array: <T extends { [key: string]: Schema }>(itemType: T) => new ArraySchemaBuilder<T>(itemType),
	object: <T extends { [key: string]: Schema }>(shape: T) => new ObjectSchemaBuilder<T>(shape)
};

const schema = {
	test: y.string().default('ezlkjez'),
	friends: y.object({
		test: y.string().optional(),
		parents: y.array({
			name: y.string().default('hello')
		})
	})
};

// First create a helper type to handle optional and nullable
type HandleOptionalAndNullable<T, Schema> = Schema extends {
	build(): { _optional: true; _nullable: true };
}
	? T | null | undefined
	: Schema extends { build(): { _optional: true } }
		? T | undefined
		: Schema extends { build(): { _nullable: true } }
			? T | null
			: T;

type NORO<N extends boolean, O extends boolean, T> = N extends true
	? O extends true
		? T | null | undefined
		: T | null
	: O extends true
		? T | undefined
		: T;
// Then update InferSchemaType to use this helper
type InferSchemaType<T> = HandleOptionalAndNullable<
	T extends StringSchemaBuilder<infer O, infer N>
		? NORO<N, O, string>
		: T extends BooleanSchemaBuilder
			? boolean
			: T extends DateSchemaBuilder
				? Date
				: T extends EmailSchemaBuilder
					? string
					: T extends UrlSchemaBuilder
						? URL
						: T extends MapSchemaBuilder<infer K, infer V>
							? Map<K, V>
							: T extends SetSchemaBuilder<infer U>
								? Set<U>
								: T extends EnumSchemaBuilder<infer E>
									? E
									: T extends XmlFragmentSchemaBuilder
										? string
										: T extends XmlElementSchemaBuilder
											? string
											: T extends XmlTextSchemaBuilder
												? string
												: T extends ArraySchemaBuilder<infer O>
													? Array<SchemaOutput<O>>
													: T extends ObjectSchemaBuilder<infer O>
														? SchemaOutput<O>
														: never,
	T
>;

export type SchemaOutput<T extends Record<string, Schema>> = Simplify<{
	[K in keyof T]: InferSchemaType<T[K]>;
}>;

type Output = SchemaOutput<typeof schema>;
