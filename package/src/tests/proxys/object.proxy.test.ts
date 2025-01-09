import { describe, it, expect, beforeEach } from 'vitest';
import { syncroState, y } from '../../lib/index.js';

const state = syncroState({
	schema: {
		object: y.object({
			name: y.string(),
			age: y.number()
		}),
		nullableObject: y
			.object({
				name: y.string(),
				age: y.number()
			})
			.nullable(),
		optionalObject: y
			.object({
				name: y.string(),
				age: y.number()
			})
			.optional(),
		nullableOptionalObject: y
			.object({
				name: y.string(),
				age: y.number()
			})
			.nullable()
			.optional(),
		objectWithDefault: y
			.object({
				name: y.string(),
				age: y.number()
			})
			.default({ name: 'default', age: 0 }),
		objectWithDefaultAndOptional: y
			.object({
				name: y.string(),
				age: y.number()
			})
			.default({ name: 'default', age: 0 })
			.optional(),
		objectWithDefaultAndNullable: y
			.object({
				name: y.string(),
				age: y.number()
			})
			.default({ name: 'default', age: 0 })
			.nullable(),
		objectWithDefaultAndNullableAndOptional: y
			.object({
				name: y.string(),
				age: y.number()
			})
			.default({ name: 'default', age: 0 })
			.nullable()
			.optional()
	}
});

describe('ObjectProxy', () => {
	describe('Initial values', () => {
		it('should be an object', () => {
			expect(state.object).toBeTypeOf('object');
			expect(state.object.name).toBeTypeOf('string');
			expect(state.object.age).toBeTypeOf('number');
		});

		it('should have null as default value for nullable object', () => {
			expect(state.nullableObject).toBe(null);
		});

		it('should have undefined as default value for optional object', () => {
			expect(state.optionalObject).toBe(undefined);
		});

		it('should have undefined as default value for nullable optional object', () => {
			expect(state.nullableOptionalObject).toBe(undefined);
		});

		it('should have default value for object with default', () => {
			expect(state.objectWithDefault).toEqual({ name: 'default', age: 0 });
		});

		it('should have default value for optional object with default', () => {
			expect(state.objectWithDefaultAndOptional).toEqual({ name: 'default', age: 0 });
		});

		it('should have default value for nullable object with default', () => {
			expect(state.objectWithDefaultAndNullable).toEqual({ name: 'default', age: 0 });
		});

		it('should have default value for nullable optional object with default', () => {
			expect(state.objectWithDefaultAndNullableAndOptional).toEqual({ name: 'default', age: 0 });
		});
	});

	describe('Setters', () => {
		describe('Object', () => {
			beforeEach(() => {
				state.object = { name: 'test', age: 25 };
			});

			it('should set the value', () => {
				state.object = { name: 'hello world', age: 30 };
				expect(state.object).toEqual({ name: 'hello world', age: 30 });
			});

			it('should not set the value to null', () => {
				(state.object as any) = null;
				expect(state.object).toEqual({ name: 'test', age: 25 });
			});

			it('should not set the value to undefined', () => {
				(state.object as any) = undefined;
				expect(state.object).toEqual({ name: 'test', age: 25 });
			});

			it('should not set the value to a string', () => {
				(state.object as any) = 'invalid';
				expect(state.object).toEqual({ name: 'test', age: 25 });
			});

			it('should not set the value to a number', () => {
				(state.object as any) = 123;
				expect(state.object).toEqual({ name: 'test', age: 25 });
			});

			it('should not set invalid object properties', () => {
				(state.object as any) = { name: 123, age: 'invalid' };
				expect(state.object).toEqual({ name: 'test', age: 25 });
			});
		});

		describe('Nullable Object', () => {
			beforeEach(() => {
				state.nullableObject = { name: 'test', age: 25 };
			});

			it('should set the value', () => {
				state.nullableObject = { name: 'hello world', age: 30 };
				expect(state.nullableObject).toEqual({ name: 'hello world', age: 30 });
			});

			it('should set the value to null', () => {
				state.nullableObject = null;
				expect(state.nullableObject).toBe(null);
			});

			it('should not set the value to undefined', () => {
				(state.nullableObject as any) = undefined;
				expect(JSON.parse(JSON.stringify(state.nullableObject))).toStrictEqual({
					name: 'test',
					age: 25
				});
			});

			it('should not set the value to a string', () => {
				(state.nullableObject as any) = 'invalid';
				expect(state.nullableObject).toEqual({ name: 'test', age: 25 });
			});

			it('should not set the value to a number', () => {
				(state.nullableObject as any) = 123;
				expect(state.nullableObject).toEqual({ name: 'test', age: 25 });
			});

			it('should not set invalid object properties', () => {
				(state.nullableObject as any) = { name: 123, age: 'invalid' };
				expect(state.nullableObject).toEqual({ name: 'test', age: 25 });
			});
		});

		describe('Optional Object', () => {
			beforeEach(() => {
				state.optionalObject = { name: 'test', age: 25 };
			});

			it('should set the value', () => {
				state.optionalObject = { name: 'hello world', age: 30 };
				expect(state.optionalObject).toEqual({ name: 'hello world', age: 30 });
			});

			it('should not set the value to null', () => {
				(state.optionalObject as any) = null;
				expect(state.optionalObject).toEqual({ name: 'test', age: 25 });
			});

			it('should set the value to undefined', () => {
				state.optionalObject = undefined;
				expect(state.optionalObject).toBe(undefined);
			});

			it('should not set the value to a string', () => {
				(state.optionalObject as any) = 'invalid';
				expect(state.optionalObject).toEqual({ name: 'test', age: 25 });
			});

			it('should not set the value to a number', () => {
				(state.optionalObject as any) = 123;
				expect(state.optionalObject).toEqual({ name: 'test', age: 25 });
			});

			it('should not set invalid object properties', () => {
				(state.optionalObject as any) = { name: 123, age: 'invalid' };
				expect(state.optionalObject).toEqual({ name: 'test', age: 25 });
			});
		});

		describe('Nullable Optional Object', () => {
			beforeEach(() => {
				state.nullableOptionalObject = { name: 'test', age: 25 };
			});

			it('should set the value', () => {
				state.nullableOptionalObject = { name: 'hello world', age: 30 };
				expect(state.nullableOptionalObject).toEqual({ name: 'hello world', age: 30 });
			});

			it('should set the value to null', () => {
				state.nullableOptionalObject = null;
				expect(state.nullableOptionalObject).toBe(null);
			});

			it('should set the value to undefined', () => {
				state.nullableOptionalObject = undefined;
				expect(state.nullableOptionalObject).toBe(undefined);
			});

			it('should not set the value to a string', () => {
				(state.nullableOptionalObject as any) = 'invalid';
				expect(state.nullableOptionalObject).toEqual({ name: 'test', age: 25 });
			});

			it('should not set the value to a number', () => {
				(state.nullableOptionalObject as any) = 123;
				expect(state.nullableOptionalObject).toEqual({ name: 'test', age: 25 });
			});

			it('should not set invalid object properties', () => {
				(state.nullableOptionalObject as any) = { name: 123, age: 'invalid' };
				expect(state.nullableOptionalObject).toEqual({ name: 'test', age: 25 });
			});
		});

		describe('Object With Default', () => {
			beforeEach(() => {
				state.objectWithDefault = { name: 'test', age: 25 };
			});

			it('should set the value', () => {
				state.objectWithDefault = { name: 'hello world', age: 30 };
				expect(state.objectWithDefault).toEqual({ name: 'hello world', age: 30 });
			});

			it('should not set the value to null', () => {
				(state.objectWithDefault as any) = null;
				expect(state.objectWithDefault).toEqual({ name: 'test', age: 25 });
			});

			it('should not set the value to undefined', () => {
				(state.objectWithDefault as any) = undefined;
				expect(state.objectWithDefault).toEqual({ name: 'test', age: 25 });
			});

			it('should not set the value to a string', () => {
				(state.objectWithDefault as any) = 'invalid';
				expect(state.objectWithDefault).toEqual({ name: 'test', age: 25 });
			});

			it('should not set the value to a number', () => {
				(state.objectWithDefault as any) = 123;
				expect(state.objectWithDefault).toEqual({ name: 'test', age: 25 });
			});

			it('should not set invalid object properties', () => {
				(state.objectWithDefault as any) = { name: 123, age: 'invalid' };
				expect(state.objectWithDefault).toEqual({ name: 'test', age: 25 });
			});
		});

		describe('Object With Default And Optional', () => {
			beforeEach(() => {
				state.objectWithDefaultAndOptional = { name: 'test', age: 25 };
			});

			it('should set the value', () => {
				state.objectWithDefaultAndOptional = { name: 'hello world', age: 30 };
				expect(state.objectWithDefaultAndOptional).toEqual({ name: 'hello world', age: 30 });
			});

			it('should not set the value to null', () => {
				(state.objectWithDefaultAndOptional as any) = null;
				expect(state.objectWithDefaultAndOptional).toEqual({ name: 'test', age: 25 });
			});

			it('should set the value to undefined', () => {
				state.objectWithDefaultAndOptional = undefined;
				expect(state.objectWithDefaultAndOptional).toBe(undefined);
			});

			it('should not set the value to a string', () => {
				(state.objectWithDefaultAndOptional as any) = 'invalid';
				expect(state.objectWithDefaultAndOptional).toEqual({ name: 'test', age: 25 });
			});

			it('should not set the value to a number', () => {
				(state.objectWithDefaultAndOptional as any) = 123;
				expect(state.objectWithDefaultAndOptional).toEqual({ name: 'test', age: 25 });
			});

			it('should not set invalid object properties', () => {
				(state.objectWithDefaultAndOptional as any) = { name: 123, age: 'invalid' };
				expect(state.objectWithDefaultAndOptional).toEqual({ name: 'test', age: 25 });
			});
		});

		describe('Object With Default And Nullable', () => {
			beforeEach(() => {
				state.objectWithDefaultAndNullable = { name: 'test', age: 25 };
			});

			it('should set the value', () => {
				state.objectWithDefaultAndNullable = { name: 'hello world', age: 30 };
				expect(state.objectWithDefaultAndNullable).toEqual({ name: 'hello world', age: 30 });
			});

			it('should set the value to null', () => {
				state.objectWithDefaultAndNullable = null;
				expect(state.objectWithDefaultAndNullable).toBe(null);
			});

			it('should not set the value to undefined', () => {
				(state.objectWithDefaultAndNullable as any) = undefined;
				expect(state.objectWithDefaultAndNullable).toEqual({ name: 'test', age: 25 });
			});

			it('should not set the value to a string', () => {
				(state.objectWithDefaultAndNullable as any) = 'invalid';
				expect(state.objectWithDefaultAndNullable).toEqual({ name: 'test', age: 25 });
			});

			it('should not set the value to a number', () => {
				(state.objectWithDefaultAndNullable as any) = 123;
				expect(state.objectWithDefaultAndNullable).toEqual({ name: 'test', age: 25 });
			});

			it('should not set invalid object properties', () => {
				(state.objectWithDefaultAndNullable as any) = { name: 123, age: 'invalid' };
				expect(state.objectWithDefaultAndNullable).toEqual({ name: 'test', age: 25 });
			});
		});

		describe('Object With Default And Nullable And Optional', () => {
			beforeEach(() => {
				state.objectWithDefaultAndNullableAndOptional = { name: 'test', age: 25 };
			});

			it('should set the value', () => {
				state.objectWithDefaultAndNullableAndOptional = { name: 'hello world', age: 30 };
				expect(state.objectWithDefaultAndNullableAndOptional).toEqual({
					name: 'hello world',
					age: 30
				});
			});

			it('should set the value to null', () => {
				state.objectWithDefaultAndNullableAndOptional = null;
				expect(state.objectWithDefaultAndNullableAndOptional).toBe(null);
			});

			it('should set the value to undefined', () => {
				state.objectWithDefaultAndNullableAndOptional = undefined;
				expect(state.objectWithDefaultAndNullableAndOptional).toBe(undefined);
			});

			it('should not set the value to a string', () => {
				(state.objectWithDefaultAndNullableAndOptional as any) = 'invalid';
				expect(state.objectWithDefaultAndNullableAndOptional).toEqual({ name: 'test', age: 25 });
			});

			it('should not set the value to a number', () => {
				(state.objectWithDefaultAndNullableAndOptional as any) = 123;
				expect(state.objectWithDefaultAndNullableAndOptional).toEqual({ name: 'test', age: 25 });
			});

			it('should not set invalid object properties', () => {
				(state.objectWithDefaultAndNullableAndOptional as any) = { name: 123, age: 'invalid' };
				expect(state.objectWithDefaultAndNullableAndOptional).toEqual({ name: 'test', age: 25 });
			});
		});
	});
});
