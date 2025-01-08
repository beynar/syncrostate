import { describe, it, expect, beforeEach } from 'vitest';
import { syncroState, y } from '../../lib/index.js';

const state = syncroState({
	schema: {
		number: y.number(),
		nullableNumber: y.number().nullable(),
		optionnalNumber: y.number().optional(),
		nullableOptionnalNumber: y.number().nullable().optional(),
		numberWithDefault: y.number().default(0),
		numberWithDefaultAndOptional: y.number().default(0).optional(),
		numberWithDefaultAndNullable: y.number().default(0).nullable(),
		numberWithDefaultAndNullableAndOptional: y.number().default(0).nullable().optional()
	}
});

describe('NumberProxy', () => {
	describe('Initial values', () => {
		it('should be a number', () => {
			expect(state.number).toBeTypeOf('number');
		});

		it('should have null as default value for nullable number', () => {
			expect(state.nullableNumber).toBe(null);
		});

		it('should have undefined as default value for optional number', () => {
			expect(state.optionnalNumber).toBe(undefined);
		});

		it('should have undefined as default value for nullable optional number', () => {
			expect(state.nullableOptionnalNumber).toBe(undefined);
		});

		it('should have default value for number with default', () => {
			expect(state.numberWithDefault).toBe(0);
		});

		it('should have default value for optional number with default', () => {
			expect(state.numberWithDefaultAndOptional).toBe(0);
		});

		it('should have default value for nullable number with default', () => {
			expect(state.numberWithDefaultAndNullable).toBe(0);
		});

		it('should have default value for nullable optional number with default', () => {
			expect(state.numberWithDefaultAndNullableAndOptional).toBe(0);
		});
	});

	describe('Setters', () => {
		describe('Number', () => {
			beforeEach(() => {
				state.number = 42;
			});

			it('should set the value', () => {
				state.number = 123;
				expect(state.number).toBe(123);
			});

			it('should not set the value to null', () => {
				state.number = null;
				expect(state.number).toBe(42);
			});

			it('should not set the value to undefined', () => {
				state.number = undefined;
				expect(state.number).toBe(42);
			});

			it('should not set the value to a string', () => {
				state.number = '123';
				expect(state.number).toBe(42);
			});

			it('should not set the value to a boolean', () => {
				state.number = true;
				expect(state.number).toBe(42);
			});

			it('should not set the value to an object', () => {
				state.number = {};
				expect(state.number).toBe(42);
			});
		});

		describe('Nullable Number', () => {
			beforeEach(() => {
				state.nullableNumber = 42;
			});

			it('should set the value', () => {
				state.nullableNumber = 123;
				expect(state.nullableNumber).toBe(123);
			});

			it('should set the value to null', () => {
				state.nullableNumber = null;
				expect(state.nullableNumber).toBe(null);
			});

			it('should not set the value to undefined', () => {
				state.nullableNumber = undefined;
				expect(state.nullableNumber).toBe(42);
			});

			it('should not set the value to a string', () => {
				state.nullableNumber = '123';
				expect(state.nullableNumber).toBe(42);
			});

			it('should not set the value to a boolean', () => {
				state.nullableNumber = true;
				expect(state.nullableNumber).toBe(42);
			});

			it('should not set the value to an object', () => {
				state.nullableNumber = {};
				expect(state.nullableNumber).toBe(42);
			});
		});

		describe('Optional Number', () => {
			beforeEach(() => {
				state.optionnalNumber = 42;
			});

			it('should set the value', () => {
				state.optionnalNumber = 123;
				expect(state.optionnalNumber).toBe(123);
			});

			it('should not set the value to null', () => {
				state.optionnalNumber = null;
				expect(state.optionnalNumber).toBe(42);
			});

			it('should set the value to undefined', () => {
				state.optionnalNumber = undefined;
				expect(state.optionnalNumber).toBe(undefined);
			});

			it('should not set the value to a string', () => {
				state.optionnalNumber = '123';
				expect(state.optionnalNumber).toBe(42);
			});

			it('should not set the value to a boolean', () => {
				state.optionnalNumber = true;
				expect(state.optionnalNumber).toBe(42);
			});

			it('should not set the value to an object', () => {
				state.optionnalNumber = {};
				expect(state.optionnalNumber).toBe(42);
			});
		});

		describe('Nullable Optional Number', () => {
			beforeEach(() => {
				state.nullableOptionnalNumber = 42;
			});

			it('should set the value', () => {
				state.nullableOptionnalNumber = 123;
				expect(state.nullableOptionnalNumber).toBe(123);
			});

			it('should set the value to null', () => {
				state.nullableOptionnalNumber = null;
				expect(state.nullableOptionnalNumber).toBe(null);
			});

			it('should set the value to undefined', () => {
				state.nullableOptionnalNumber = undefined;
				expect(state.nullableOptionnalNumber).toBe(undefined);
			});

			it('should not set the value to a string', () => {
				state.nullableOptionnalNumber = '123';
				expect(state.nullableOptionnalNumber).toBe(42);
			});

			it('should not set the value to a boolean', () => {
				state.nullableOptionnalNumber = true;
				expect(state.nullableOptionnalNumber).toBe(42);
			});

			it('should not set the value to an object', () => {
				state.nullableOptionnalNumber = {};
				expect(state.nullableOptionnalNumber).toBe(42);
			});
		});

		describe('Number With Default', () => {
			beforeEach(() => {
				state.numberWithDefault = 42;
			});

			it('should set the value', () => {
				state.numberWithDefault = 123;
				expect(state.numberWithDefault).toBe(123);
			});

			it('should not set the value to null', () => {
				state.numberWithDefault = null;
				expect(state.numberWithDefault).toBe(42);
			});

			it('should not set the value to undefined', () => {
				state.numberWithDefault = undefined;
				expect(state.numberWithDefault).toBe(42);
			});

			it('should not set the value to a string', () => {
				state.numberWithDefault = '123';
				expect(state.numberWithDefault).toBe(42);
			});

			it('should not set the value to a boolean', () => {
				state.numberWithDefault = true;
				expect(state.numberWithDefault).toBe(42);
			});

			it('should not set the value to an object', () => {
				state.numberWithDefault = {};
				expect(state.numberWithDefault).toBe(42);
			});
		});

		describe('Number With Default And Optional', () => {
			beforeEach(() => {
				state.numberWithDefaultAndOptional = 42;
			});

			it('should set the value', () => {
				state.numberWithDefaultAndOptional = 123;
				expect(state.numberWithDefaultAndOptional).toBe(123);
			});

			it('should not set the value to null', () => {
				state.numberWithDefaultAndOptional = null;
				expect(state.numberWithDefaultAndOptional).toBe(42);
			});

			it('should set the value to undefined', () => {
				state.numberWithDefaultAndOptional = undefined;
				expect(state.numberWithDefaultAndOptional).toBe(undefined);
			});

			it('should not set the value to a string', () => {
				state.numberWithDefaultAndOptional = '123';
				expect(state.numberWithDefaultAndOptional).toBe(42);
			});

			it('should not set the value to a boolean', () => {
				state.numberWithDefaultAndOptional = true;
				expect(state.numberWithDefaultAndOptional).toBe(42);
			});

			it('should not set the value to an object', () => {
				state.numberWithDefaultAndOptional = {};
				expect(state.numberWithDefaultAndOptional).toBe(42);
			});
		});

		describe('Number With Default And Nullable', () => {
			beforeEach(() => {
				state.numberWithDefaultAndNullable = 42;
			});

			it('should set the value', () => {
				state.numberWithDefaultAndNullable = 123;
				expect(state.numberWithDefaultAndNullable).toBe(123);
			});

			it('should set the value to null', () => {
				state.numberWithDefaultAndNullable = null;
				expect(state.numberWithDefaultAndNullable).toBe(null);
			});

			it('should not set the value to undefined', () => {
				state.numberWithDefaultAndNullable = undefined;
				expect(state.numberWithDefaultAndNullable).toBe(42);
			});

			it('should not set the value to a string', () => {
				state.numberWithDefaultAndNullable = '123';
				expect(state.numberWithDefaultAndNullable).toBe(42);
			});

			it('should not set the value to a boolean', () => {
				state.numberWithDefaultAndNullable = true;
				expect(state.numberWithDefaultAndNullable).toBe(42);
			});

			it('should not set the value to an object', () => {
				state.numberWithDefaultAndNullable = {};
				expect(state.numberWithDefaultAndNullable).toBe(42);
			});
		});

		describe('Number With Default And Nullable And Optional', () => {
			beforeEach(() => {
				state.numberWithDefaultAndNullableAndOptional = 42;
			});

			it('should set the value', () => {
				state.numberWithDefaultAndNullableAndOptional = 123;
				expect(state.numberWithDefaultAndNullableAndOptional).toBe(123);
			});

			it('should set the value to null', () => {
				state.numberWithDefaultAndNullableAndOptional = null;
				expect(state.numberWithDefaultAndNullableAndOptional).toBe(null);
			});

			it('should set the value to undefined', () => {
				state.numberWithDefaultAndNullableAndOptional = undefined;
				expect(state.numberWithDefaultAndNullableAndOptional).toBe(undefined);
			});

			it('should not set the value to a string', () => {
				state.numberWithDefaultAndNullableAndOptional = '123';
				expect(state.numberWithDefaultAndNullableAndOptional).toBe(42);
			});

			it('should not set the value to a boolean', () => {
				state.numberWithDefaultAndNullableAndOptional = true;
				expect(state.numberWithDefaultAndNullableAndOptional).toBe(42);
			});

			it('should not set the value to an object', () => {
				state.numberWithDefaultAndNullableAndOptional = {};
				expect(state.numberWithDefaultAndNullableAndOptional).toBe(42);
			});
		});
	});
});
