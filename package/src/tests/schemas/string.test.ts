import { describe, it, expect } from 'vitest';
import { y } from '../../lib/schemas/schema.js';
import { NULL } from '$lib/constants.js';

describe('StringValidator', () => {
	describe('basic validation', () => {
		const schema = y.string();

		it('should validate string values', () => {
			expect(schema.isValid('hello')).toBe(true);
			expect(schema.isValid('')).toBe(true);
		});

		it('should reject non-string values', () => {
			expect(schema.isValid(123)).toBe(false);
			expect(schema.isValid({})).toBe(false);
			expect(schema.isValid([])).toBe(false);
			expect(schema.isValid(null)).toBe(false);
			expect(schema.isValid(undefined)).toBe(false);
		});
	});

	describe('optional', () => {
		const schema = y.string().optional();

		it('should allow undefined when optional', () => {
			expect(schema.isValid(undefined)).toBe(true);
			// expect(schema.isValid('test')).toBe(true);
		});
	});

	describe('nullable', () => {
		const schema = y.string().nullable();

		it('should allow null when nullable', () => {
			expect(schema.isValid(null)).toBe(true);
			expect(schema.isValid('test')).toBe(true);
		});
	});

	describe('min length', () => {
		const schema = y.string().min(3);

		it('should validate strings with minimum length', () => {
			expect(schema.isValid('abc')).toBe(true);
			expect(schema.isValid('abcd')).toBe(true);
			expect(schema.isValid('ab')).toBe(false);
		});
	});

	describe('max length', () => {
		const schema = y.string().max(3);

		it('should validate strings with maximum length', () => {
			expect(schema.isValid('abc')).toBe(true);
			expect(schema.isValid('ab')).toBe(true);
			expect(schema.isValid('abcd')).toBe(false);
		});
	});

	describe('pattern', () => {
		const schema = y.string().pattern(/^[A-Z]+$/);

		it('should validate strings matching the pattern', () => {
			expect(schema.isValid('ABC')).toBe(true);
			expect(schema.isValid('abc')).toBe(false);
			expect(schema.isValid('123')).toBe(false);
		});
	});

	describe('coercion', () => {
		const schema = y.string();

		it('should coerce values correctly', () => {
			expect(schema.coerce('test')).toBe('test');
			expect(schema.coerce(null as any)).toBe(null);
		});
	});

	describe('stringify', () => {
		const schema = y.string();

		it('should stringify values correctly', () => {
			expect(schema.stringify('test')).toBe('test');
			expect(schema.stringify(null)).toBe(NULL);
		});
	});
});
