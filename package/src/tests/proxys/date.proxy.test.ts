import { describe, it, expect, beforeEach } from 'vitest';
import { syncroState, y } from '../../lib/index.js';

const defaultDate = new Date('2024-01-01');

const state = syncroState({
	schema: {
		date: y.date(),
		nullableDate: y.date().nullable(),
		optionnalDate: y.date().optional(),
		nullableOptionnalDate: y.date().nullable().optional(),
		dateWithDefault: y.date().default(defaultDate),
		dateWithDefaultAndOptional: y.date().default(defaultDate).optional(),
		dateWithDefaultAndNullable: y.date().default(defaultDate).nullable(),
		dateWithDefaultAndNullableAndOptional: y.date().default(defaultDate).nullable().optional()
	}
});

describe('DateProxy', () => {
	describe('Initial values', () => {
		it('should be a date', () => {
			expect(state.date).toBeInstanceOf(Date);
		});

		it('should have null as default value for nullable date', () => {
			expect(state.nullableDate).toBe(null);
		});

		it('should have undefined as default value for optional date', () => {
			expect(state.optionnalDate).toBe(undefined);
		});

		it('should have undefined as default value for nullable optional date', () => {
			expect(state.nullableOptionnalDate).toBe(undefined);
		});

		it('should have default value for date with default', () => {
			expect(state.dateWithDefault.toISOString()).toEqual(defaultDate.toISOString());
		});

		it('should have default value for optional date with default', () => {
			expect(state.dateWithDefaultAndOptional?.toISOString()).toEqual(defaultDate.toISOString());
		});

		it('should have default value for nullable date with default', () => {
			expect(state.dateWithDefaultAndNullable?.toISOString()).toEqual(defaultDate.toISOString());
		});

		it('should have default value for nullable optional date with default', () => {
			expect(state.dateWithDefaultAndNullableAndOptional?.toISOString()).toEqual(
				defaultDate.toISOString()
			);
		});
	});

	describe('Setters', () => {
		const testDate = new Date('2024-02-01');

		describe('Date', () => {
			beforeEach(() => {
				state.date = testDate;
			});

			it('should set the value', () => {
				const newDate = new Date('2024-03-01');
				state.date = newDate;
				expect(state.date.toISOString()).toEqual(newDate.toISOString());
			});

			it('should not set the value to null', () => {
				state.date = null;
				expect(state.date.toISOString()).toEqual(testDate.toISOString());
			});

			it('should not set the value to undefined', () => {
				state.date = undefined;
				expect(state.date.toISOString()).toEqual(testDate.toISOString());
			});

			it('should not set the value to a string', () => {
				state.date = '2024-03-01';
				expect(state.date.toISOString()).toEqual(testDate.toISOString());
			});

			it('should not set the value to a number', () => {
				state.date = 123;
				expect(state.date.toISOString()).toEqual(testDate.toISOString());
			});

			it('should not set the value to an object', () => {
				state.date = {};
				expect(state.date.toISOString()).toEqual(testDate.toISOString());
			});
		});

		describe('Nullable Date', () => {
			beforeEach(() => {
				state.nullableDate = testDate;
			});

			it('should set the value', () => {
				const newDate = new Date('2024-03-01');
				state.nullableDate = newDate;
				expect(state.nullableDate.toISOString()).toEqual(newDate.toISOString());
			});

			it('should set the value to null', () => {
				state.nullableDate = null;
				expect(state.nullableDate).toBe(null);
			});

			it('should not set the value to undefined', () => {
				state.nullableDate = undefined;
				expect(state.nullableDate?.toISOString()).toEqual(testDate.toISOString());
			});

			it('should not set the value to a string', () => {
				state.nullableDate = '2024-03-01' as any;
				expect(state.nullableDate?.toISOString()).toEqual(testDate.toISOString());
			});

			it('should not set the value to a number', () => {
				state.nullableDate = 123 as any;
				expect(state.nullableDate?.toISOString()).toEqual(testDate.toISOString());
			});

			it('should not set the value to an object', () => {
				state.nullableDate = {} as any;
				expect(state.nullableDate?.toISOString()).toEqual(testDate.toISOString());
			});
		});

		describe('Optional Date', () => {
			beforeEach(() => {
				state.optionnalDate = testDate;
			});

			it('should set the value', () => {
				const newDate = new Date('2024-03-01');
				state.optionnalDate = newDate;
				expect(state.optionnalDate?.toISOString()).toEqual(newDate.toISOString());
			});

			it('should not set the value to null', () => {
				state.optionnalDate = null;
				expect(state.optionnalDate?.toISOString()).toEqual(testDate.toISOString());
			});

			it('should set the value to undefined', () => {
				state.optionnalDate = undefined;
				expect(state.optionnalDate).toBe(undefined);
			});

			it('should not set the value to a string', () => {
				state.optionnalDate = '2024-03-01' as any;
				expect(state.optionnalDate?.toISOString()).toEqual(testDate.toISOString());
			});

			it('should not set the value to a number', () => {
				state.optionnalDate = 123 as any;
				expect(state.optionnalDate?.toISOString()).toEqual(testDate.toISOString());
			});

			it('should not set the value to an object', () => {
				state.optionnalDate = {} as any;
				expect(state.optionnalDate?.toISOString()).toEqual(testDate.toISOString());
			});
		});

		describe('Nullable Optional Date', () => {
			beforeEach(() => {
				state.nullableOptionnalDate = testDate;
			});

			it('should set the value', () => {
				const newDate = new Date('2024-03-01');
				state.nullableOptionnalDate = newDate;
				expect(state.nullableOptionnalDate?.toISOString()).toEqual(newDate.toISOString());
			});

			it('should set the value to null', () => {
				state.nullableOptionnalDate = null;
				expect(state.nullableOptionnalDate).toBe(null);
			});

			it('should set the value to undefined', () => {
				state.nullableOptionnalDate = undefined;
				expect(state.nullableOptionnalDate).toBe(undefined);
			});

			it('should not set the value to a string', () => {
				state.nullableOptionnalDate = '2024-03-01' as any;
				expect(state.nullableOptionnalDate?.toISOString()).toEqual(testDate.toISOString());
			});

			it('should not set the value to a number', () => {
				state.nullableOptionnalDate = 123 as any;
				expect(state.nullableOptionnalDate?.toISOString()).toEqual(testDate.toISOString());
			});

			it('should not set the value to an object', () => {
				state.nullableOptionnalDate = {} as any;
				expect(state.nullableOptionnalDate?.toISOString()).toEqual(testDate.toISOString());
			});
		});

		describe('Date With Default', () => {
			beforeEach(() => {
				state.dateWithDefault = testDate;
			});

			it('should set the value', () => {
				const newDate = new Date('2024-03-01');
				state.dateWithDefault = newDate;
				expect(state.dateWithDefault?.toISOString()).toEqual(newDate.toISOString());
			});

			it('should not set the value to null', () => {
				state.dateWithDefault = null;
				expect(state.dateWithDefault?.toISOString()).toEqual(testDate.toISOString());
			});

			it('should not set the value to undefined', () => {
				state.dateWithDefault = undefined;
				expect(state.dateWithDefault?.toISOString()).toEqual(testDate.toISOString());
			});

			it('should not set the value to a string', () => {
				state.dateWithDefault = '2024-03-01' as any;
				expect(state.dateWithDefault.toISOString()).toEqual(testDate.toISOString());
			});

			it('should not set the value to a number', () => {
				state.dateWithDefault = 123 as any;
				expect(state.dateWithDefault.toISOString()).toEqual(testDate.toISOString());
			});

			it('should not set the value to an object', () => {
				state.dateWithDefault = {} as any;
				expect(state.dateWithDefault.toISOString()).toEqual(testDate.toISOString());
			});
		});

		describe('Date With Default And Optional', () => {
			beforeEach(() => {
				state.dateWithDefaultAndOptional = testDate;
			});

			it('should set the value', () => {
				const newDate = new Date('2024-03-01');
				state.dateWithDefaultAndOptional = newDate;
				expect(state.dateWithDefaultAndOptional?.toISOString()).toEqual(newDate.toISOString());
			});

			it('should not set the value to null', () => {
				state.dateWithDefaultAndOptional = null;
				expect(state.dateWithDefaultAndOptional?.toISOString()).toEqual(testDate.toISOString());
			});

			it('should set the value to undefined', () => {
				state.dateWithDefaultAndOptional = undefined;
				expect(state.dateWithDefaultAndOptional).toBe(undefined);
			});

			it('should not set the value to a string', () => {
				state.dateWithDefaultAndOptional = '2024-03-01' as any;
				expect(state.dateWithDefaultAndOptional?.toISOString()).toEqual(testDate.toISOString());
			});

			it('should not set the value to a number', () => {
				state.dateWithDefaultAndOptional = 123 as any;
				expect(state.dateWithDefaultAndOptional?.toISOString()).toEqual(testDate.toISOString());
			});

			it('should not set the value to an object', () => {
				state.dateWithDefaultAndOptional = {} as any;
				expect(state.dateWithDefaultAndOptional?.toISOString()).toEqual(testDate.toISOString());
			});
		});

		describe('Date With Default And Nullable', () => {
			beforeEach(() => {
				state.dateWithDefaultAndNullable = testDate;
			});

			it('should set the value', () => {
				const newDate = new Date('2024-03-01');
				state.dateWithDefaultAndNullable = newDate;
				expect(state.dateWithDefaultAndNullable?.toISOString()).toEqual(newDate.toISOString());
			});

			it('should set the value to null', () => {
				state.dateWithDefaultAndNullable = null;
				expect(state.dateWithDefaultAndNullable).toBe(null);
			});

			it('should not set the value to undefined', () => {
				state.dateWithDefaultAndNullable = undefined;
				expect(state.dateWithDefaultAndNullable?.toISOString()).toEqual(testDate.toISOString());
			});

			it('should not set the value to a string', () => {
				state.dateWithDefaultAndNullable = '2024-03-01' as any;
				expect(state.dateWithDefaultAndNullable?.toISOString()).toEqual(testDate.toISOString());
			});

			it('should not set the value to a number', () => {
				state.dateWithDefaultAndNullable = 123 as any;
				expect(state.dateWithDefaultAndNullable?.toISOString()).toEqual(testDate.toISOString());
			});

			it('should not set the value to an object', () => {
				state.dateWithDefaultAndNullable = {} as any;
				expect(state.dateWithDefaultAndNullable?.toISOString()).toEqual(testDate.toISOString());
			});
		});

		describe('Date With Default And Nullable And Optional', () => {
			beforeEach(() => {
				state.dateWithDefaultAndNullableAndOptional = testDate;
			});

			it('should set the value', () => {
				const newDate = new Date('2024-03-01');
				state.dateWithDefaultAndNullableAndOptional = newDate;
				expect(state.dateWithDefaultAndNullableAndOptional?.toISOString()).toEqual(
					newDate.toISOString()
				);
			});

			it('should set the value to null', () => {
				state.dateWithDefaultAndNullableAndOptional = null;
				expect(state.dateWithDefaultAndNullableAndOptional).toBe(null);
			});

			it('should set the value to undefined', () => {
				state.dateWithDefaultAndNullableAndOptional = undefined;
				expect(state.dateWithDefaultAndNullableAndOptional).toBe(undefined);
			});

			it('should not set the value to a string', () => {
				state.dateWithDefaultAndNullableAndOptional = '2024-03-01' as any;
				expect(state.dateWithDefaultAndNullableAndOptional?.toISOString()).toEqual(
					testDate.toISOString()
				);
			});

			it('should not set the value to a number', () => {
				state.dateWithDefaultAndNullableAndOptional = 123 as any;
				expect(state.dateWithDefaultAndNullableAndOptional?.toISOString()).toEqual(
					testDate.toISOString()
				);
			});

			it('should not set the value to an object', () => {
				state.dateWithDefaultAndNullableAndOptional = {} as any;
				expect(state.dateWithDefaultAndNullableAndOptional?.toISOString()).toEqual(
					testDate.toISOString()
				);
			});
		});
	});
});
