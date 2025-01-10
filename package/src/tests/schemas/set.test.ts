import { describe, it, expect } from 'vitest';
import { y } from '../../lib/schemas/schema.js';

describe('SetValidator', () => {
	describe('basic validation', () => {
		const schema = y.set(y.string());

		it('should validate sets with correct types', () => {
			expect(schema.isValid(new Set(['hello', 'world']))).toBe(true);
			expect(schema.isValid(new Set())).toBe(true);
			expect(schema.isValid(new Set(['']))).toBe(true);
		});

		it('should reject sets with incorrect types', () => {
			expect(schema.isValid(new Set([1, 2, 3]))).toBe(false);
			expect(schema.isValid(new Set(['hello', 123]))).toBe(false);
			expect(schema.isValid(new Set([null]))).toBe(false);
			expect(schema.isValid(new Set([undefined]))).toBe(false);
		});

		it('should reject non-set values', () => {
			expect(schema.isValid('not a set')).toBe(false);
			expect(schema.isValid(123)).toBe(false);
			expect(schema.isValid({})).toBe(false);
			expect(schema.isValid([])).toBe(false);
			expect(schema.isValid(null)).toBe(false);
			expect(schema.isValid(undefined)).toBe(false);
		});
	});

	describe('primitive validators', () => {
		const stringSchema = y.set(y.string());
		const numberSchema = y.set(y.number());
		const booleanSchema = y.set(y.boolean());

		it('should validate string sets', () => {
			expect(stringSchema.isValid(new Set(['a', 'b', 'c']))).toBe(true);
			expect(stringSchema.isValid(new Set(['']))).toBe(true);
			expect(stringSchema.isValid(new Set([123]))).toBe(false);
		});

		it('should validate number sets', () => {
			expect(numberSchema.isValid(new Set([1, 2, 3]))).toBe(true);
			expect(numberSchema.isValid(new Set([0]))).toBe(true);
			expect(numberSchema.isValid(new Set(['1']))).toBe(false);
		});

		it('should validate boolean sets', () => {
			expect(booleanSchema.isValid(new Set([true, false]))).toBe(true);
			expect(booleanSchema.isValid(new Set([true]))).toBe(true);
			expect(booleanSchema.isValid(new Set(['true']))).toBe(false);
		});
	});

	describe('optional', () => {
		const schema = y.set(y.string()).optional();

		it('should allow undefined when optional', () => {
			expect(schema.isValid(undefined)).toBe(true);
			expect(schema.isValid(new Set(['test']))).toBe(true);
		});
	});

	describe('nullable', () => {
		const schema = y.set(y.string()).nullable();

		it('should allow null when nullable', () => {
			expect(schema.isValid(null)).toBe(true);
			expect(schema.isValid(new Set(['test']))).toBe(true);
		});
	});

	describe('parse', () => {
		const schema = y.set(y.string());

		it('should parse valid sets', () => {
			const validSet = new Set(['hello', 'world']);
			expect(schema.parse(validSet)).toEqual({ isValid: true, value: validSet });
		});

		it('should handle invalid inputs', () => {
			expect(schema.parse(new Set([1, 2]))).toEqual({ isValid: false, value: new Set() });
			expect(schema.parse(null)).toEqual({ isValid: false, value: new Set() });
		});
	});

	describe('coercion', () => {
		const schema = y.set(y.string());

		it('should coerce valid sets', () => {
			const validSet = new Set(['hello', 'world']);
			expect(schema.coerce(validSet)).toEqual(validSet);
		});

		it('should filter out invalid items', () => {
			const mixedSet = new Set(['valid', 123, 'also valid']);
			expect(schema.coerce(mixedSet)).toEqual(new Set(['valid', 'also valid']));
		});

		it('should handle null and invalid inputs', () => {
			const nullableSchema = schema.nullable();
			expect(nullableSchema.coerce(null)).toBe(null);
			expect(schema.coerce(new Set([1, 2, 3]))).toEqual(new Set());
		});
	});

	describe('default values', () => {
		const defaultSet = new Set(['default']);
		const schema = y.set(y.string()).default(defaultSet);

		it('should use default value when input is invalid', () => {
			expect(schema.coerce(null)).toEqual(defaultSet);
			expect(schema.coerce(undefined)).toEqual(defaultSet);
		});

		it('should not use default value when input is valid', () => {
			const validSet = new Set(['hello']);
			expect(schema.coerce(validSet)).toEqual(validSet);
		});
	});
});
