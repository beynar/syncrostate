import { describe, it, expect } from 'vitest';
import { y } from '../../lib/index.js';

describe('DiscriminatedUnion Simplified API', () => {
	describe('Basic functionality', () => {
		it('should create a discriminated union with simplified syntax', () => {
			const validator = y.discriminatedUnion('status', [
				{ status: y.literal('success'), data: y.string() },
				{ status: y.literal('error'), message: y.string() }
			]);

			expect(validator.$schema.kind).toBe('discriminatedUnion');
			expect(validator.$schema.discriminantKey).toBe('status');
			expect(validator.$schema.variantValidators).toHaveLength(2);
		});

		it('should validate success variant correctly', () => {
			const validator = y.discriminatedUnion('status', [
				{ status: y.literal('success'), data: y.string() },
				{ status: y.literal('error'), message: y.string() }
			]);

			const successValue = { status: 'success', data: 'Hello world' };
			expect(validator.isValid(successValue)).toBe(true);
		});

		it('should validate error variant correctly', () => {
			const validator = y.discriminatedUnion('status', [
				{ status: y.literal('success'), data: y.string() },
				{ status: y.literal('error'), message: y.string() }
			]);

			const errorValue = { status: 'error', message: 'Something went wrong' };
			expect(validator.isValid(errorValue)).toBe(true);
		});

		it('should reject invalid discriminant values', () => {
			const validator = y.discriminatedUnion('status', [
				{ status: y.literal('success'), data: y.string() },
				{ status: y.literal('error'), message: y.string() }
			]);

			const invalidValue = { status: 'invalid', data: 'test' };
			expect(validator.isValid(invalidValue)).toBe(false);
		});

		it('should reject missing discriminant key', () => {
			const validator = y.discriminatedUnion('status', [
				{ status: y.literal('success'), data: y.string() },
				{ status: y.literal('error'), message: y.string() }
			]);

			const invalidValue = { data: 'test' };
			expect(validator.isValid(invalidValue)).toBe(false);
		});
	});

	describe('Nullability and optionality', () => {
		it('should handle nullable discriminated unions', () => {
			const validator = y
				.discriminatedUnion('status', [
					{ status: y.literal('success'), data: y.string() },
					{ status: y.literal('error'), message: y.string() }
				])
				.nullable();

			expect(validator.isValid(null)).toBe(true);
			expect(validator.isValid({ status: 'success', data: 'test' })).toBe(true);
		});

		it('should handle optional discriminated unions', () => {
			const validator = y
				.discriminatedUnion('status', [
					{ status: y.literal('success'), data: y.string() },
					{ status: y.literal('error'), message: y.string() }
				])
				.optional();

			expect(validator.isValid(undefined)).toBe(true);
			expect(validator.isValid({ status: 'success', data: 'test' })).toBe(true);
		});
	});

	describe('Type coercion', () => {
		it('should coerce valid values correctly', () => {
			const validator = y.discriminatedUnion('status', [
				{ status: y.literal('success'), data: y.string() },
				{ status: y.literal('error'), message: y.string() }
			]);

			const value = { status: 'success', data: 'Hello' };
			const coerced = validator.coerce(value);
			expect(coerced).toEqual(value);
		});

		it('should return null for invalid values', () => {
			const validator = y.discriminatedUnion('status', [
				{ status: y.literal('success'), data: y.string() },
				{ status: y.literal('error'), message: y.string() }
			]);

			const invalid = { status: 'invalid', data: 'test' };
			const coerced = validator.coerce(invalid);
			expect(coerced).toBeNull();
		});
	});
});
