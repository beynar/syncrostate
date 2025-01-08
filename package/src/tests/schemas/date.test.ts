import { describe, it, expect } from 'vitest';
import { y } from '../../lib/schemas/schema.js';
import { NULL } from '$lib/constants.js';

describe('DateValidator', () => {
	describe('basic validation', () => {
		const schema = y.date();
		const testDate = new Date('2024-01-07T12:00:00Z');

		it('should validate Date objects', () => {
			expect(schema.isValid(testDate)).toBe(true);
			expect(schema.isValid(new Date())).toBe(true);
		});

		it('should reject invalid dates', () => {
			expect(schema.isValid('invalid-date')).toBe(false);
			expect(schema.isValid('2024-13-45')).toBe(false);
			expect(schema.isValid({})).toBe(false);
			expect(schema.isValid([])).toBe(false);
			expect(schema.isValid(null)).toBe(false);
			expect(schema.isValid(undefined)).toBe(false);
		});
	});

	describe('min/max constraints', () => {
		const minDate = new Date('2024-01-01');
		const maxDate = new Date('2024-12-31');
		const schema = y.date().min(minDate).max(maxDate);

		it('should validate dates within range', () => {
			expect(schema.isValid(new Date('2024-06-15'))).toBe(true);
			expect(schema.isValid(minDate)).toBe(true);
			expect(schema.isValid(maxDate)).toBe(true);
		});

		it('should reject dates outside range', () => {
			expect(schema.isValid(new Date('2023-12-31'))).toBe(false);
			expect(schema.isValid(new Date('2025-01-01'))).toBe(false);
		});
	});

	describe('optional', () => {
		const schema = y.date().optional();

		it('should allow undefined when optional', () => {
			expect(schema.isValid(undefined)).toBe(true);
			expect(schema.isValid(new Date())).toBe(true);
		});
	});

	describe('nullable', () => {
		const schema = y.date().nullable();

		it('should allow null when nullable', () => {
			expect(schema.isValid(null)).toBe(true);
			expect(schema.isValid(new Date())).toBe(true);
		});
	});

	describe('parse', () => {
		const schema = y.date();
		const testDate = new Date('2024-01-07T12:00:00Z');

		it('should parse valid date strings', () => {
			const result = schema.parse('2024-01-07T12:00:00Z');
			expect(result.isValid).toBe(true);
			expect(result.value?.toISOString()).toBe(testDate.toISOString());
		});

		it('should handle invalid inputs', () => {
			expect(schema.parse('invalid-date')).toEqual({ isValid: false, value: null });
			console.log(schema.parse(null));
			expect(schema.parse(null)).toEqual({ isValid: false, value: null });
		});
	});

	describe('coercion', () => {
		const schema = y.date();
		const testDate = new Date('2024-01-07T12:00:00Z');

		it('should coerce valid date strings', () => {
			const result = schema.coerce('2024-01-07T12:00:00Z');
			expect(result?.toISOString()).toBe(testDate.toISOString());
		});

		it('should handle null and invalid inputs', () => {
			expect(schema.coerce(null)).toBe(null);
			expect(schema.coerce('invalid-date')).toBe(null);
		});
	});

	describe('stringify', () => {
		const schema = y.date();
		const testDate = new Date('2024-01-07T12:00:00Z');

		it('should stringify dates correctly', () => {
			expect(schema.stringify(testDate)).toBe(testDate.toISOString());
		});

		it('should handle null and invalid inputs', () => {
			expect(schema.stringify(null)).toBe(NULL);
			expect(schema.stringify('invalid-date')).toBe(NULL);
		});
	});
});
