import { describe, it, expect } from 'vitest';
import { y } from '../../lib/schemas/schema.js';
import { NULL } from '$lib/constants.js';

describe('EnumValidator', () => {
	describe('basic validation', () => {
		const schema = y.enum('red', 'green', 'blue');
		const numSchema = y.enum(1, 2, 3);

		it('should validate string enum values', () => {
			expect(schema.isValid('red')).toBe(true);
			expect(schema.isValid('green')).toBe(true);
			expect(schema.isValid('blue')).toBe(true);
		});

		it('should validate number enum values', () => {
			expect(numSchema.isValid(1)).toBe(true);
			expect(numSchema.isValid(2)).toBe(true);
			expect(numSchema.isValid(3)).toBe(true);
		});

		it('should reject invalid enum values', () => {
			expect(schema.isValid('yellow')).toBe(false);
			expect(schema.isValid('')).toBe(false);
			expect(schema.isValid(123)).toBe(false);
			expect(schema.isValid({})).toBe(false);
			expect(schema.isValid([])).toBe(false);
			expect(schema.isValid(null)).toBe(false);
			expect(schema.isValid(undefined)).toBe(false);

			expect(numSchema.isValid(4)).toBe(false);
			expect(numSchema.isValid(0)).toBe(false);
			expect(numSchema.isValid('1')).toBe(false);
		});
	});

	describe('optional', () => {
		const schema = y.enum('red', 'green', 'blue').optional();

		it('should allow undefined when optional', () => {
			expect(schema.isValid(undefined)).toBe(true);
			expect(schema.isValid('red')).toBe(true);
		});
	});

	describe('nullable', () => {
		const schema = y.enum('red', 'green', 'blue').nullable();

		it('should allow null when nullable', () => {
			expect(schema.isValid(null)).toBe(true);
			expect(schema.isValid('red')).toBe(true);
		});
	});

	describe('parse', () => {
		const schema = y.enum('red', 'green', 'blue');

		it('should parse valid enum strings', () => {
			expect(schema.parse('red')).toEqual({ isValid: true, value: 'red' });
			expect(schema.parse('green')).toEqual({ isValid: true, value: 'green' });
		});

		it('should handle invalid inputs', () => {
			expect(schema.parse('yellow')).toEqual({ isValid: false, value: null });
			expect(schema.parse(null)).toEqual({ isValid: false, value: null });
		});
	});

	describe('coercion', () => {
		const schema = y.enum('red', 'green', 'blue');

		it('should coerce valid enum values', () => {
			expect(schema.coerce('red')).toBe('red');
			expect(schema.coerce('green')).toBe('green');
		});

		it('should handle null and invalid inputs', () => {
			expect(schema.coerce(null)).toBe(null);
			expect(schema.coerce('yellow')).toBe(null);
		});
	});

	describe('stringify', () => {
		const schema = y.enum('red', 'green', 'blue');

		it('should stringify enum values correctly', () => {
			expect(schema.stringify('red')).toBe('red');
			expect(schema.stringify('green')).toBe('green');
		});

		it('should handle null and invalid inputs', () => {
			expect(schema.stringify(null)).toBe(NULL);
			expect(schema.stringify('yellow')).toBe('');
		});
	});
});
