import { describe, it, expect, beforeEach } from 'vitest';
import { syncroState, y } from '../../lib/index.js';

const state = syncroState({
	schema: {
		string: y.string(),
		nullableString: y.string().nullable(),
		optionnalString: y.string().optional(),
		nullableOptionnalString: y.string().nullable().optional(),
		stringWithDefault: y.string().default('default'),
		stringWithDefaultAndOptional: y.string().default('default').optional(),
		stringWithDefaultAndNullable: y.string().default('default').nullable(),
		stringWithDefaultAndNullableAndOptional: y.string().default('default').nullable().optional()
	}
});

describe('StringProxy', () => {
	describe('Initial values', () => {
		it('should be a string', () => {
			expect(state.string).toBeTypeOf('string');
		});
		it('should have null as default value for nullable string', () => {
			expect(state.nullableString).toBe(null);
		});

		it('should have undefined as default value for optional string', () => {
			expect(state.optionnalString).toBe(undefined);
		});

		it('should have undefined as default value for nullable optional string', () => {
			expect(state.nullableOptionnalString).toBe(undefined);
		});

		it('should have default value for string with default', () => {
			expect(state.stringWithDefault).toBe('default');
		});

		it('should have default value for optional string with default', () => {
			expect(state.stringWithDefaultAndOptional).toBe('default');
		});

		it('should have default value for nullable string with default', () => {
			expect(state.stringWithDefaultAndNullable).toBe('default');
		});

		it('should have default value for nullable optional string with default', () => {
			expect(state.stringWithDefaultAndNullableAndOptional).toBe('default');
		});
	});

	describe('Setters', () => {
		describe('String', () => {
			beforeEach(() => {
				state.string = 'test';
			});
			it('should set the value', () => {
				state.string = 'hello world';
				expect(state.string).toBe('hello world');
			});

			it('should set the value to empty string', () => {
				state.string = '';
				expect(state.string).toBe('');
			});

			it('should not set the value to null', () => {
				state.string = null;
				expect(state.string).toBe('test');
			});

			it('should not set the value to undefined', () => {
				state.string = undefined;
				expect(state.string).toBe('test');
			});

			it('should not set the value to a number', () => {
				state.string = 123;
				expect(state.string).toBe('test');
			});

			it('should not set the value to an object', () => {
				state.string = {};
				expect(state.string).toBe('test');
			});
		});

		describe('Nullable String', () => {
			beforeEach(() => {
				state.nullableString = 'test';
			});
			it('should set the value', () => {
				state.nullableString = 'hello world';
				expect(state.nullableString).toBe('hello world');
			});

			it('should set the value to empty string', () => {
				state.nullableString = '';
				expect(state.nullableString).toBe('');
			});

			it('should set the value to null', () => {
				state.nullableString = null;
				expect(state.nullableString).toBe(null);
			});

			it('should not set the value to undefined', () => {
				state.nullableString = undefined;
				expect(state.nullableString).toBe('test');
			});

			it('should not set the value to a number', () => {
				state.nullableString = 123;
				expect(state.nullableString).toBe('test');
			});

			it('should not set the value to an object', () => {
				state.nullableString = {};
				expect(state.nullableString).toBe('test');
			});
		});

		describe('Optional String', () => {
			beforeEach(() => {
				state.optionnalString = 'test';
			});
			it('should set the value', () => {
				state.optionnalString = 'hello world';
				expect(state.optionnalString).toBe('hello world');
			});

			it('should set the value to empty string', () => {
				state.optionnalString = '';
				expect(state.optionnalString).toBe('');
			});

			it('should not set the value to null', () => {
				state.optionnalString = null;
				expect(state.optionnalString).toBe('test');
			});

			it('should set the value to undefined', () => {
				state.optionnalString = undefined;
				expect(state.optionnalString).toBe(undefined);
			});

			it('should not set the value to a number', () => {
				state.optionnalString = 123;
				expect(state.optionnalString).toBe('test');
			});

			it('should not set the value to an object', () => {
				state.optionnalString = {};
				expect(state.optionnalString).toBe('test');
			});
		});

		describe('Nullable Optional String', () => {
			beforeEach(() => {
				state.nullableOptionnalString = 'test';
			});
			it('should set the value', () => {
				state.nullableOptionnalString = 'hello world';
				expect(state.nullableOptionnalString).toBe('hello world');
			});

			it('should set the value to empty string', () => {
				state.nullableOptionnalString = '';
				expect(state.nullableOptionnalString).toBe('');
			});

			it('should set the value to null', () => {
				state.nullableOptionnalString = null;
				expect(state.nullableOptionnalString).toBe(null);
			});

			it('should set the value to undefined', () => {
				state.nullableOptionnalString = undefined;
				expect(state.nullableOptionnalString).toBe(undefined);
			});

			it('should not set the value to a number', () => {
				state.nullableOptionnalString = 123;
				expect(state.nullableOptionnalString).toBe('test');
			});

			it('should not set the value to an object', () => {
				state.nullableOptionnalString = {};
				expect(state.nullableOptionnalString).toBe('test');
			});
		});

		describe('String With Default', () => {
			beforeEach(() => {
				state.stringWithDefault = 'test';
			});
			it('should set the value', () => {
				state.stringWithDefault = 'hello world';
				expect(state.stringWithDefault).toBe('hello world');
			});

			it('should set the value to empty string', () => {
				state.stringWithDefault = '';
				expect(state.stringWithDefault).toBe('');
			});

			it('should not set the value to null', () => {
				state.stringWithDefault = null;
				expect(state.stringWithDefault).toBe('test');
			});

			it('should not set the value to undefined', () => {
				state.stringWithDefault = undefined;
				expect(state.stringWithDefault).toBe('test');
			});

			it('should not set the value to a number', () => {
				state.stringWithDefault = 123;
				expect(state.stringWithDefault).toBe('test');
			});

			it('should not set the value to an object', () => {
				state.stringWithDefault = {};
				expect(state.stringWithDefault).toBe('test');
			});
		});

		describe('String With Default And Optional', () => {
			beforeEach(() => {
				state.stringWithDefaultAndOptional = 'test';
			});
			it('should set the value', () => {
				state.stringWithDefaultAndOptional = 'hello world';
				expect(state.stringWithDefaultAndOptional).toBe('hello world');
			});

			it('should set the value to empty string', () => {
				state.stringWithDefaultAndOptional = '';
				expect(state.stringWithDefaultAndOptional).toBe('');
			});

			it('should not set the value to null', () => {
				state.stringWithDefaultAndOptional = null;
				expect(state.stringWithDefaultAndOptional).toBe('test');
			});

			it('should set the value to undefined', () => {
				state.stringWithDefaultAndOptional = undefined;
				expect(state.stringWithDefaultAndOptional).toBe(undefined);
			});

			it('should not set the value to a number', () => {
				state.stringWithDefaultAndOptional = 123;
				expect(state.stringWithDefaultAndOptional).toBe('test');
			});

			it('should not set the value to an object', () => {
				state.stringWithDefaultAndOptional = {};
				expect(state.stringWithDefaultAndOptional).toBe('test');
			});
		});

		describe('String With Default And Nullable', () => {
			beforeEach(() => {
				state.stringWithDefaultAndNullable = 'test';
			});
			it('should set the value', () => {
				state.stringWithDefaultAndNullable = 'hello world';
				expect(state.stringWithDefaultAndNullable).toBe('hello world');
			});

			it('should set the value to empty string', () => {
				state.stringWithDefaultAndNullable = '';
				expect(state.stringWithDefaultAndNullable).toBe('');
			});

			it('should set the value to null', () => {
				state.stringWithDefaultAndNullable = null;
				expect(state.stringWithDefaultAndNullable).toBe(null);
			});

			it('should not set the value to undefined', () => {
				state.stringWithDefaultAndNullable = undefined;
				expect(state.stringWithDefaultAndNullable).toBe('test');
			});

			it('should not set the value to a number', () => {
				state.stringWithDefaultAndNullable = 123;
				expect(state.stringWithDefaultAndNullable).toBe('test');
			});

			it('should not set the value to an object', () => {
				state.stringWithDefaultAndNullable = {};
				expect(state.stringWithDefaultAndNullable).toBe('test');
			});
		});

		describe('String With Default And Nullable And Optional', () => {
			beforeEach(() => {
				state.stringWithDefaultAndNullableAndOptional = 'test';
			});
			it('should set the value', () => {
				state.stringWithDefaultAndNullableAndOptional = 'hello world';
				expect(state.stringWithDefaultAndNullableAndOptional).toBe('hello world');
			});

			it('should set the value to empty string', () => {
				state.stringWithDefaultAndNullableAndOptional = '';
				expect(state.stringWithDefaultAndNullableAndOptional).toBe('');
			});

			it('should set the value to null', () => {
				state.stringWithDefaultAndNullableAndOptional = null;
				expect(state.stringWithDefaultAndNullableAndOptional).toBe(null);
			});

			it('should set the value to undefined', () => {
				state.stringWithDefaultAndNullableAndOptional = undefined;
				expect(state.stringWithDefaultAndNullableAndOptional).toBe(undefined);
			});

			it('should not set the value to a number', () => {
				state.stringWithDefaultAndNullableAndOptional = 123;
				expect(state.stringWithDefaultAndNullableAndOptional).toBe('test');
			});

			it('should not set the value to an object', () => {
				state.stringWithDefaultAndNullableAndOptional = {};
				expect(state.stringWithDefaultAndNullableAndOptional).toBe('test');
			});
		});
	});
});
