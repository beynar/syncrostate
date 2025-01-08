import { describe, it, expect } from 'vitest';
import { y } from '../../lib/schemas/schema.js';
import { NULL } from '$lib/constants.js';

describe('NumberValidator', () => {
	describe('basic validation', () => {
		const schema = y.number();

		it('should validate number values', () => {
			expect(schema.isValid(123)).toBe(true);
			expect(schema.isValid(0)).toBe(true);
			expect(schema.isValid(-123)).toBe(true);
			expect(schema.isValid(123.456)).toBe(true);
		});

		it('should reject non-number values', () => {
			expect(schema.isValid('123')).toBe(false);
			expect(schema.isValid({})).toBe(false);
			expect(schema.isValid([])).toBe(false);
			expect(schema.isValid(null)).toBe(false);
			expect(schema.isValid(undefined)).toBe(false);
			expect(schema.isValid(NaN)).toBe(false);
		});
	});

	describe('optional', () => {
		const schema = y.number().optional();

		it('should allow undefined when optional', () => {
			expect(schema.isValid(undefined)).toBe(true);
			expect(schema.isValid(123)).toBe(true);
		});
	});

	describe('nullable', () => {
		const schema = y.number().nullable();

		it('should allow null when nullable', () => {
			expect(schema.isValid(null)).toBe(true);
			expect(schema.isValid(123)).toBe(true);
		});
	});

	describe('parse', () => {
		const schema = y.number();

		it('should parse valid number strings', () => {
			expect(schema.parse('123')).toEqual({ isValid: true, value: 123 });
			expect(schema.parse('-123.456')).toEqual({ isValid: true, value: -123.456 });
		});

		it('should handle invalid inputs', () => {
			expect(schema.parse('abc')).toEqual({ isValid: false, value: null });
			expect(schema.parse(null)).toEqual({ isValid: false, value: null });
		});
	});

	describe('coercion', () => {
		const schema = y.number();

		it('should coerce valid number strings', () => {
			expect(schema.coerce('123')).toBe(123);
			expect(schema.coerce('-123.456')).toBe(-123.456);
		});

		it('should handle null and invalid inputs', () => {
			expect(schema.coerce(null)).toBe(null);
			expect(schema.coerce('abc')).toBe(null);
		});
	});

	describe('stringify', () => {
		const schema = y.number();

		it('should stringify numbers correctly', () => {
			expect(schema.stringify(123)).toBe('123');
			expect(schema.stringify(-123.456)).toBe('-123.456');
		});

		it('should handle null and invalid inputs', () => {
			expect(schema.stringify(null)).toBe(NULL);
			expect(schema.stringify('abc')).toBe(NULL);
		});
	});
});
