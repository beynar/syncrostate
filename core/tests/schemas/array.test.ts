import { describe, it, expect } from 'vitest';
import { y } from '../../lib/schemas/schema.js';

describe('ArrayValidator', () => {
	describe('basic validation', () => {
		const schema = y.array(y.string());

		it('should validate arrays with correct types', () => {
			expect(schema.isValid(['hello', 'world'])).toBe(true);
			expect(schema.isValid([])).toBe(true);
			expect(schema.isValid([''])).toBe(true);
		});

		it('should reject arrays with incorrect types', () => {
			expect(schema.isValid([1, 2, 3])).toBe(false);
			expect(schema.isValid(['hello', 123])).toBe(false);
			expect(schema.isValid([null])).toBe(false);
			expect(schema.isValid([undefined])).toBe(false);
		});

		it('should reject non-array values', () => {
			expect(schema.isValid('not an array')).toBe(false);
			expect(schema.isValid(123)).toBe(false);
			expect(schema.isValid({})).toBe(false);
			expect(schema.isValid(null)).toBe(false);
			expect(schema.isValid(undefined)).toBe(false);
		});
	});

	describe('nested types', () => {
		const schema = y.array(
			y.object({
				name: y.string(),
				age: y.number()
			})
		);

		it('should validate arrays of objects with correct types', () => {
			expect(
				schema.isValid([
					{ name: 'John', age: 30 },
					{ name: 'Jane', age: 25 }
				])
			).toBe(true);
		});

		it('should reject arrays of objects with incorrect types', () => {
			expect(
				schema.isValid([
					{ name: 'John', age: '30' },
					{ name: 123, age: 25 }
				])
			).toBe(false);
		});

		const nestedArraySchema = y.array(y.array(y.number()));

		it('should validate nested arrays with correct types', () => {
			expect(
				nestedArraySchema.isValid([
					[1, 2],
					[3, 4]
				])
			).toBe(true);
			expect(nestedArraySchema.isValid([[]])).toBe(true);
		});

		it('should reject nested arrays with incorrect types', () => {
			expect(
				nestedArraySchema.isValid([
					[1, '2'],
					[3, 4]
				])
			).toBe(false);
			expect(nestedArraySchema.isValid([1, [2, 3]])).toBe(false);
		});
	});

	describe('optional', () => {
		const schema = y.array(y.string()).optional();

		it('should allow undefined when optional', () => {
			expect(schema.isValid(undefined)).toBe(true);
			expect(schema.isValid(['test'])).toBe(true);
		});
	});

	describe('nullable', () => {
		const schema = y.array(y.string()).nullable();

		it('should allow null when nullable', () => {
			expect(schema.isValid(null)).toBe(true);
			expect(schema.isValid(['test'])).toBe(true);
		});
	});

	describe('validation and coercion', () => {
		const schema = y.array(y.number());

		it('should validate and return valid arrays', () => {
			const validArr = [1, 2, 3];
			const { isValid, value } = schema.parse(validArr);
			expect(isValid).toBe(true);
			expect(value).toEqual(validArr);
		});

		it('should return null for invalid arrays', () => {
			const { isValid, value } = schema.parse(['1', '2', '3']);
			expect(isValid).toBe(false);
			expect(value).toBe(null);
		});
	});

	describe('array with nullable items', () => {
		const schema = y.array(y.string().nullable());

		it('should validate arrays with null values when items are nullable', () => {
			expect(schema.isValid(['hello', null, 'world'])).toBe(true);
		});

		it('should still reject arrays with undefined or other invalid types', () => {
			expect(schema.isValid(['hello', undefined, 'world'])).toBe(false);
			expect(schema.isValid(['hello', 123, 'world'])).toBe(false);
		});
	});

	describe('array with optional items', () => {
		const schema = y.array(y.string().optional());

		it('should validate arrays with undefined values when items are optional', () => {
			expect(schema.isValid(['hello', undefined, 'world'])).toBe(true);
		});

		it('should still reject arrays with invalid types', () => {
			expect(schema.isValid(['hello', 123, 'world'])).toBe(false);
			expect(schema.isValid(['hello', null, 'world'])).toBe(false);
		});
	});

	describe('default values', () => {
		const schema = y.array(y.string()).default(['default']);

		it('should use default value when input is invalid', () => {
			expect(schema.coerce(null)).toEqual(['default']);
			expect(schema.coerce(undefined)).toEqual(['default']);
		});

		it('should not use default value when input is valid', () => {
			expect(schema.coerce(['hello'])).toEqual(['hello']);
		});
	});
});
