import { describe, it, expect, beforeEach } from 'vitest';
import { syncroState, y } from '../../lib/index.js';

const state = syncroState({
	schema: {
		enum: y.enum('a', 'b', 'c'),
		nullableEnum: y.enum('a', 'b', 'c').nullable(),
		optionnalEnum: y.enum('a', 'b', 'c').optional(),
		nullableOptionnalEnum: y.enum('a', 'b', 'c').nullable().optional(),
		enumWithDefault: y.enum('a', 'b', 'c').default('a'),
		enumWithDefaultAndOptional: y.enum('a', 'b', 'c').default('a').optional(),
		enumWithDefaultAndNullable: y.enum('a', 'b', 'c').default('a').nullable(),
		enumWithDefaultAndNullableAndOptional: y.enum('a', 'b', 'c').default('a').nullable().optional()
	}
});

describe('EnumProxy', () => {
	describe('Initial values', () => {
		it('should be a string', () => {
			expect(state.enum).toBeTypeOf('string');
		});

		it('should have null as default value for nullable enum', () => {
			expect(state.nullableEnum).toBe(null);
		});

		it('should have undefined as default value for optional enum', () => {
			expect(state.optionnalEnum).toBe(undefined);
		});

		it('should have undefined as default value for nullable optional enum', () => {
			expect(state.nullableOptionnalEnum).toBe(undefined);
		});

		it('should have default value for enum with default', () => {
			expect(state.enumWithDefault).toBe('a');
		});

		it('should have default value for optional enum with default', () => {
			expect(state.enumWithDefaultAndOptional).toBe('a');
		});

		it('should have default value for nullable enum with default', () => {
			expect(state.enumWithDefaultAndNullable).toBe('a');
		});

		it('should have default value for nullable optional enum with default', () => {
			expect(state.enumWithDefaultAndNullableAndOptional).toBe('a');
		});
	});

	describe('Setters', () => {
		describe('Enum', () => {
			beforeEach(() => {
				state.enum = 'a';
			});

			it('should set the value to a valid enum value', () => {
				state.enum = 'b';
				expect(state.enum).toBe('b');
			});

			it('should not set the value to an invalid enum value', () => {
				state.enum = 'd';
				expect(state.enum).toBe('a');
			});

			it('should not set the value to null', () => {
				state.enum = null;
				expect(state.enum).toBe('a');
			});

			it('should not set the value to undefined', () => {
				state.enum = undefined;
				expect(state.enum).toBe('a');
			});

			it('should not set the value to a number', () => {
				state.enum = 123;
				expect(state.enum).toBe('a');
			});

			it('should not set the value to an object', () => {
				state.enum = {};
				expect(state.enum).toBe('a');
			});
		});

		describe('Nullable Enum', () => {
			beforeEach(() => {
				state.nullableEnum = 'a';
			});

			it('should set the value to a valid enum value', () => {
				state.nullableEnum = 'b';
				expect(state.nullableEnum).toBe('b');
			});

			it('should not set the value to an invalid enum value', () => {
				state.nullableEnum = 'd';
				expect(state.nullableEnum).toBe('a');
			});

			it('should set the value to null', () => {
				state.nullableEnum = null;
				expect(state.nullableEnum).toBe(null);
			});

			it('should not set the value to undefined', () => {
				state.nullableEnum = undefined;
				expect(state.nullableEnum).toBe('a');
			});

			it('should not set the value to a number', () => {
				state.nullableEnum = 123;
				expect(state.nullableEnum).toBe('a');
			});

			it('should not set the value to an object', () => {
				state.nullableEnum = {};
				expect(state.nullableEnum).toBe('a');
			});
		});

		describe('Optional Enum', () => {
			beforeEach(() => {
				state.optionnalEnum = 'a';
			});

			it('should set the value to a valid enum value', () => {
				state.optionnalEnum = 'b';
				expect(state.optionnalEnum).toBe('b');
			});

			it('should not set the value to an invalid enum value', () => {
				state.optionnalEnum = 'd';
				expect(state.optionnalEnum).toBe('a');
			});

			it('should not set the value to null', () => {
				state.optionnalEnum = null;
				expect(state.optionnalEnum).toBe('a');
			});

			it('should set the value to undefined', () => {
				state.optionnalEnum = undefined;
				expect(state.optionnalEnum).toBe(undefined);
			});

			it('should not set the value to a number', () => {
				state.optionnalEnum = 123;
				expect(state.optionnalEnum).toBe('a');
			});

			it('should not set the value to an object', () => {
				state.optionnalEnum = {};
				expect(state.optionnalEnum).toBe('a');
			});
		});

		describe('Nullable Optional Enum', () => {
			beforeEach(() => {
				state.nullableOptionnalEnum = 'a';
			});

			it('should set the value to a valid enum value', () => {
				state.nullableOptionnalEnum = 'b';
				expect(state.nullableOptionnalEnum).toBe('b');
			});

			it('should not set the value to an invalid enum value', () => {
				state.nullableOptionnalEnum = 'd';
				expect(state.nullableOptionnalEnum).toBe('a');
			});

			it('should set the value to null', () => {
				state.nullableOptionnalEnum = null;
				expect(state.nullableOptionnalEnum).toBe(null);
			});

			it('should set the value to undefined', () => {
				state.nullableOptionnalEnum = undefined;
				expect(state.nullableOptionnalEnum).toBe(undefined);
			});

			it('should not set the value to a number', () => {
				state.nullableOptionnalEnum = 123;
				expect(state.nullableOptionnalEnum).toBe('a');
			});

			it('should not set the value to an object', () => {
				state.nullableOptionnalEnum = {};
				expect(state.nullableOptionnalEnum).toBe('a');
			});
		});

		describe('Enum With Default', () => {
			beforeEach(() => {
				state.enumWithDefault = 'b';
			});

			it('should set the value to a valid enum value', () => {
				state.enumWithDefault = 'c';
				expect(state.enumWithDefault).toBe('c');
			});

			it('should not set the value to an invalid enum value', () => {
				state.enumWithDefault = 'd';
				expect(state.enumWithDefault).toBe('b');
			});

			it('should not set the value to null', () => {
				state.enumWithDefault = null;
				expect(state.enumWithDefault).toBe('b');
			});

			it('should not set the value to undefined', () => {
				state.enumWithDefault = undefined;
				expect(state.enumWithDefault).toBe('b');
			});

			it('should not set the value to a number', () => {
				state.enumWithDefault = 123;
				expect(state.enumWithDefault).toBe('b');
			});

			it('should not set the value to an object', () => {
				state.enumWithDefault = {};
				expect(state.enumWithDefault).toBe('b');
			});
		});

		describe('Enum With Default And Optional', () => {
			beforeEach(() => {
				state.enumWithDefaultAndOptional = 'b';
			});

			it('should set the value to a valid enum value', () => {
				state.enumWithDefaultAndOptional = 'c';
				expect(state.enumWithDefaultAndOptional).toBe('c');
			});

			it('should not set the value to an invalid enum value', () => {
				state.enumWithDefaultAndOptional = 'd';
				expect(state.enumWithDefaultAndOptional).toBe('b');
			});

			it('should not set the value to null', () => {
				state.enumWithDefaultAndOptional = null;
				expect(state.enumWithDefaultAndOptional).toBe('b');
			});

			it('should set the value to undefined', () => {
				state.enumWithDefaultAndOptional = undefined;
				expect(state.enumWithDefaultAndOptional).toBe(undefined);
			});

			it('should not set the value to a number', () => {
				state.enumWithDefaultAndOptional = 123;
				expect(state.enumWithDefaultAndOptional).toBe('b');
			});

			it('should not set the value to an object', () => {
				state.enumWithDefaultAndOptional = {};
				expect(state.enumWithDefaultAndOptional).toBe('b');
			});
		});

		describe('Enum With Default And Nullable', () => {
			beforeEach(() => {
				state.enumWithDefaultAndNullable = 'b';
			});

			it('should set the value to a valid enum value', () => {
				state.enumWithDefaultAndNullable = 'c';
				expect(state.enumWithDefaultAndNullable).toBe('c');
			});

			it('should not set the value to an invalid enum value', () => {
				state.enumWithDefaultAndNullable = 'd';
				expect(state.enumWithDefaultAndNullable).toBe('b');
			});

			it('should set the value to null', () => {
				state.enumWithDefaultAndNullable = null;
				expect(state.enumWithDefaultAndNullable).toBe(null);
			});

			it('should not set the value to undefined', () => {
				state.enumWithDefaultAndNullable = undefined;
				expect(state.enumWithDefaultAndNullable).toBe('b');
			});

			it('should not set the value to a number', () => {
				state.enumWithDefaultAndNullable = 123;
				expect(state.enumWithDefaultAndNullable).toBe('b');
			});

			it('should not set the value to an object', () => {
				state.enumWithDefaultAndNullable = {};
				expect(state.enumWithDefaultAndNullable).toBe('b');
			});
		});

		describe('Enum With Default And Nullable And Optional', () => {
			beforeEach(() => {
				state.enumWithDefaultAndNullableAndOptional = 'b';
			});

			it('should set the value to a valid enum value', () => {
				state.enumWithDefaultAndNullableAndOptional = 'c';
				expect(state.enumWithDefaultAndNullableAndOptional).toBe('c');
			});

			it('should not set the value to an invalid enum value', () => {
				state.enumWithDefaultAndNullableAndOptional = 'd';
				expect(state.enumWithDefaultAndNullableAndOptional).toBe('b');
			});

			it('should set the value to null', () => {
				state.enumWithDefaultAndNullableAndOptional = null;
				expect(state.enumWithDefaultAndNullableAndOptional).toBe(null);
			});

			it('should set the value to undefined', () => {
				state.enumWithDefaultAndNullableAndOptional = undefined;
				expect(state.enumWithDefaultAndNullableAndOptional).toBe(undefined);
			});

			it('should not set the value to a number', () => {
				state.enumWithDefaultAndNullableAndOptional = 123;
				expect(state.enumWithDefaultAndNullableAndOptional).toBe('b');
			});

			it('should not set the value to an object', () => {
				state.enumWithDefaultAndNullableAndOptional = {};
				expect(state.enumWithDefaultAndNullableAndOptional).toBe('b');
			});
		});
	});
});
