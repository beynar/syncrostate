import { describe, it, expect, beforeEach } from 'vitest';
import { syncroState, y } from '../../lib/index.js';

const state = syncroState({
	schema: {
		boolean: y.boolean(),
		nullableBoolean: y.boolean().nullable(),
		optionnalBoolean: y.boolean().optional(),
		nullableOptionnalBoolean: y.boolean().nullable().optional(),
		booleanWithDefault: y.boolean().default(false),
		booleanWithDefaultAndOptional: y.boolean().default(false).optional(),
		booleanWithDefaultAndNullable: y.boolean().default(false).nullable(),
		booleanWithDefaultAndNullableAndOptional: y.boolean().default(false).nullable().optional()
	}
});

describe('BooleanProxy', () => {
	describe('Initial values', () => {
		it('should be a boolean', () => {
			expect(state.boolean).toBeTypeOf('boolean');
		});

		it('should have null as default value for nullable boolean', () => {
			expect(state.nullableBoolean).toBe(null);
		});

		it('should have undefined as default value for optional boolean', () => {
			expect(state.optionnalBoolean).toBe(undefined);
		});

		it('should have undefined as default value for nullable optional boolean', () => {
			expect(state.nullableOptionnalBoolean).toBe(undefined);
		});

		it('should have default value for boolean with default', () => {
			expect(state.booleanWithDefault).toBe(false);
		});

		it('should have default value for optional boolean with default', () => {
			expect(state.booleanWithDefaultAndOptional).toBe(false);
		});

		it('should have default value for nullable boolean with default', () => {
			expect(state.booleanWithDefaultAndNullable).toBe(false);
		});

		it('should have default value for nullable optional boolean with default', () => {
			expect(state.booleanWithDefaultAndNullableAndOptional).toBe(false);
		});
	});

	describe('Setters', () => {
		describe('Boolean', () => {
			beforeEach(() => {
				state.boolean = true;
			});

			it('should set the value', () => {
				state.boolean = false;
				expect(state.boolean).toBe(false);
			});

			it('should not set the value to null', () => {
				state.boolean = null;
				expect(state.boolean).toBe(true);
			});

			it('should not set the value to undefined', () => {
				state.boolean = undefined;
				expect(state.boolean).toBe(true);
			});

			it('should not set the value to a string', () => {
				state.boolean = 'true';
				expect(state.boolean).toBe(true);
			});

			it('should not set the value to a number', () => {
				state.boolean = 1;
				expect(state.boolean).toBe(true);
			});

			it('should not set the value to an object', () => {
				state.boolean = {};
				expect(state.boolean).toBe(true);
			});
		});

		describe('Nullable Boolean', () => {
			beforeEach(() => {
				state.nullableBoolean = true;
			});

			it('should set the value', () => {
				state.nullableBoolean = false;
				expect(state.nullableBoolean).toBe(false);
			});

			it('should set the value to null', () => {
				state.nullableBoolean = null;
				expect(state.nullableBoolean).toBe(null);
			});

			it('should not set the value to undefined', () => {
				state.nullableBoolean = undefined;
				expect(state.nullableBoolean).toBe(true);
			});

			it('should not set the value to a string', () => {
				state.nullableBoolean = 'true';
				expect(state.nullableBoolean).toBe(true);
			});

			it('should not set the value to a number', () => {
				state.nullableBoolean = 1;
				expect(state.nullableBoolean).toBe(true);
			});

			it('should not set the value to an object', () => {
				state.nullableBoolean = {};
				expect(state.nullableBoolean).toBe(true);
			});
		});

		describe('Optional Boolean', () => {
			beforeEach(() => {
				state.optionnalBoolean = true;
			});

			it('should set the value', () => {
				state.optionnalBoolean = false;
				expect(state.optionnalBoolean).toBe(false);
			});

			it('should not set the value to null', () => {
				state.optionnalBoolean = null;
				expect(state.optionnalBoolean).toBe(true);
			});

			it('should set the value to undefined', () => {
				state.optionnalBoolean = undefined;
				expect(state.optionnalBoolean).toBe(undefined);
			});

			it('should not set the value to a string', () => {
				state.optionnalBoolean = 'true';
				expect(state.optionnalBoolean).toBe(true);
			});

			it('should not set the value to a number', () => {
				state.optionnalBoolean = 1;
				expect(state.optionnalBoolean).toBe(true);
			});

			it('should not set the value to an object', () => {
				state.optionnalBoolean = {};
				expect(state.optionnalBoolean).toBe(true);
			});
		});

		describe('Nullable Optional Boolean', () => {
			beforeEach(() => {
				state.nullableOptionnalBoolean = true;
			});

			it('should set the value', () => {
				state.nullableOptionnalBoolean = false;
				expect(state.nullableOptionnalBoolean).toBe(false);
			});

			it('should set the value to null', () => {
				state.nullableOptionnalBoolean = null;
				expect(state.nullableOptionnalBoolean).toBe(null);
			});

			it('should set the value to undefined', () => {
				state.nullableOptionnalBoolean = undefined;
				expect(state.nullableOptionnalBoolean).toBe(undefined);
			});

			it('should not set the value to a string', () => {
				state.nullableOptionnalBoolean = 'true';
				expect(state.nullableOptionnalBoolean).toBe(true);
			});

			it('should not set the value to a number', () => {
				state.nullableOptionnalBoolean = 1;
				expect(state.nullableOptionnalBoolean).toBe(true);
			});

			it('should not set the value to an object', () => {
				state.nullableOptionnalBoolean = {};
				expect(state.nullableOptionnalBoolean).toBe(true);
			});
		});

		describe('Boolean With Default', () => {
			beforeEach(() => {
				state.booleanWithDefault = true;
			});

			it('should set the value', () => {
				state.booleanWithDefault = false;
				expect(state.booleanWithDefault).toBe(false);
			});

			it('should not set the value to null', () => {
				state.booleanWithDefault = null;
				expect(state.booleanWithDefault).toBe(true);
			});

			it('should not set the value to undefined', () => {
				state.booleanWithDefault = undefined;
				expect(state.booleanWithDefault).toBe(true);
			});

			it('should not set the value to a string', () => {
				state.booleanWithDefault = 'true';
				expect(state.booleanWithDefault).toBe(true);
			});

			it('should not set the value to a number', () => {
				state.booleanWithDefault = 1;
				expect(state.booleanWithDefault).toBe(true);
			});

			it('should not set the value to an object', () => {
				state.booleanWithDefault = {};
				expect(state.booleanWithDefault).toBe(true);
			});
		});

		describe('Boolean With Default And Optional', () => {
			beforeEach(() => {
				state.booleanWithDefaultAndOptional = true;
			});

			it('should set the value', () => {
				state.booleanWithDefaultAndOptional = false;
				expect(state.booleanWithDefaultAndOptional).toBe(false);
			});

			it('should not set the value to null', () => {
				state.booleanWithDefaultAndOptional = null;
				expect(state.booleanWithDefaultAndOptional).toBe(true);
			});

			it('should set the value to undefined', () => {
				state.booleanWithDefaultAndOptional = undefined;
				expect(state.booleanWithDefaultAndOptional).toBe(undefined);
			});

			it('should not set the value to a string', () => {
				state.booleanWithDefaultAndOptional = 'true';
				expect(state.booleanWithDefaultAndOptional).toBe(true);
			});

			it('should not set the value to a number', () => {
				state.booleanWithDefaultAndOptional = 1;
				expect(state.booleanWithDefaultAndOptional).toBe(true);
			});

			it('should not set the value to an object', () => {
				state.booleanWithDefaultAndOptional = {};
				expect(state.booleanWithDefaultAndOptional).toBe(true);
			});
		});

		describe('Boolean With Default And Nullable', () => {
			beforeEach(() => {
				state.booleanWithDefaultAndNullable = true;
			});

			it('should set the value', () => {
				state.booleanWithDefaultAndNullable = false;
				expect(state.booleanWithDefaultAndNullable).toBe(false);
			});

			it('should set the value to null', () => {
				state.booleanWithDefaultAndNullable = null;
				expect(state.booleanWithDefaultAndNullable).toBe(null);
			});

			it('should not set the value to undefined', () => {
				state.booleanWithDefaultAndNullable = undefined;
				expect(state.booleanWithDefaultAndNullable).toBe(true);
			});

			it('should not set the value to a string', () => {
				state.booleanWithDefaultAndNullable = 'true';
				expect(state.booleanWithDefaultAndNullable).toBe(true);
			});

			it('should not set the value to a number', () => {
				state.booleanWithDefaultAndNullable = 1;
				expect(state.booleanWithDefaultAndNullable).toBe(true);
			});

			it('should not set the value to an object', () => {
				state.booleanWithDefaultAndNullable = {};
				expect(state.booleanWithDefaultAndNullable).toBe(true);
			});
		});

		describe('Boolean With Default And Nullable And Optional', () => {
			beforeEach(() => {
				state.booleanWithDefaultAndNullableAndOptional = true;
			});

			it('should set the value', () => {
				state.booleanWithDefaultAndNullableAndOptional = false;
				expect(state.booleanWithDefaultAndNullableAndOptional).toBe(false);
			});

			it('should set the value to null', () => {
				state.booleanWithDefaultAndNullableAndOptional = null;
				expect(state.booleanWithDefaultAndNullableAndOptional).toBe(null);
			});

			it('should set the value to undefined', () => {
				state.booleanWithDefaultAndNullableAndOptional = undefined;
				expect(state.booleanWithDefaultAndNullableAndOptional).toBe(undefined);
			});

			it('should not set the value to a string', () => {
				state.booleanWithDefaultAndNullableAndOptional = 'true';
				expect(state.booleanWithDefaultAndNullableAndOptional).toBe(true);
			});

			it('should not set the value to a number', () => {
				state.booleanWithDefaultAndNullableAndOptional = 1;
				expect(state.booleanWithDefaultAndNullableAndOptional).toBe(true);
			});

			it('should not set the value to an object', () => {
				state.booleanWithDefaultAndNullableAndOptional = {};
				expect(state.booleanWithDefaultAndNullableAndOptional).toBe(true);
			});
		});
	});
});
