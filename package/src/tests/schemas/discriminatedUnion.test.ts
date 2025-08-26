import { describe, it, expect } from 'vitest';
import { DiscriminatedUnionValidator } from '../../lib/schemas/discriminatedUnion.js';
import { y } from '../../lib/schemas/schema.js';

describe('DiscriminatedUnionValidator', () => {
	describe('Basic functionality', () => {
		it('should create a discriminated union with literal discriminants', () => {
			const validator = y.discriminatedUnion('status', [
				y.object({ status: y.literal('success'), data: y.string() }),
				y.object({ status: y.literal('failed'), error: y.string() })
			]);

			expect(validator.$schema.kind).toBe('discriminatedUnion');
			expect(validator.$schema.discriminantKey).toBe('status');
			expect(validator.$schema.variants).toHaveLength(2);
		});

		it('should validate success variant correctly', () => {
			const validator = y.discriminatedUnion('status', [
				y.object({ status: y.literal('success'), data: y.string() }),
				y.object({ status: y.literal('failed'), error: y.string() })
			]);

			const validSuccess = { status: 'success', data: 'Hello world' };
			const invalidSuccess = { status: 'success', data: 123 };
			const wrongDiscriminant = { status: 'pending', data: 'Hello' };

			expect(validator.isValid(validSuccess)).toBe(true);
			expect(validator.isValid(invalidSuccess)).toBe(false);
			expect(validator.isValid(wrongDiscriminant)).toBe(false);
		});

		it('should validate failed variant correctly', () => {
			const validator = y.discriminatedUnion('status', [
				y.object({ status: y.literal('success'), data: y.string() }),
				y.object({ status: y.literal('failed'), error: y.string() })
			]);

			const validFailure = { status: 'failed', error: 'Something went wrong' };
			const invalidFailure = { status: 'failed', error: 123 };
			const missingProperty = { status: 'failed' };

			expect(validator.isValid(validFailure)).toBe(true);
			expect(validator.isValid(invalidFailure)).toBe(false);
			expect(validator.isValid(missingProperty)).toBe(false);
		});

		it('should reject invalid discriminant values', () => {
			const validator = y.discriminatedUnion('status', [
				y.object({ status: y.literal('success'), data: y.string() }),
				y.object({ status: y.literal('failed'), error: y.string() })
			]);

			const invalidDiscriminant = { status: 'unknown', data: 'test' };
			const missingDiscriminant = { data: 'test' };

			expect(validator.isValid(invalidDiscriminant)).toBe(false);
			expect(validator.isValid(missingDiscriminant)).toBe(false);
		});
	});

	describe('Complex discriminated unions', () => {
		it('should handle multiple variants with different shapes', () => {
			const validator = y.discriminatedUnion('type', [
				y.object({ type: y.literal('user'), name: y.string(), email: y.string() }),
				y.object({ type: y.literal('admin'), name: y.string(), permissions: y.array(y.string()) }),
				y.object({ type: y.literal('guest'), sessionId: y.string() })
			]);

			const validUser = { type: 'user', name: 'John', email: 'john@example.com' };
			const validAdmin = { type: 'admin', name: 'Admin', permissions: ['read', 'write'] };
			const validGuest = { type: 'guest', sessionId: 'abc123' };

			expect(validator.isValid(validUser)).toBe(true);
			expect(validator.isValid(validAdmin)).toBe(true);
			expect(validator.isValid(validGuest)).toBe(true);

			// Cross-contamination tests
			const userWithPermissions = { type: 'user', name: 'John', permissions: ['read'] };
			const adminWithEmail = { type: 'admin', name: 'Admin', email: 'admin@example.com' };

			expect(validator.isValid(userWithPermissions)).toBe(false);
			expect(validator.isValid(adminWithEmail)).toBe(false);
		});

		it('should work with number discriminants', () => {
			const validator = y.discriminatedUnion('code', [
				y.object({ code: y.literal(200), message: y.string() }),
				y.object({ code: y.literal(404), error: y.string() }),
				y.object({ code: y.literal(500), error: y.string(), details: y.string() })
			]);

			const success = { code: 200, message: 'OK' };
			const notFound = { code: 404, error: 'Not found' };
			const serverError = {
				code: 500,
				error: 'Internal error',
				details: 'Database connection failed'
			};

			expect(validator.isValid(success)).toBe(true);
			expect(validator.isValid(notFound)).toBe(true);
			expect(validator.isValid(serverError)).toBe(true);

			const invalidCode = { code: 201, message: 'Created' };
			expect(validator.isValid(invalidCode)).toBe(false);
		});
	});

	describe('Nullability and optionality', () => {
		it('should handle nullable discriminated unions', () => {
			const validator = y
				.discriminatedUnion('status', [
					y.object({ status: y.literal('success'), data: y.string() }),
					y.object({ status: y.literal('failed'), error: y.string() })
				])
				.nullable();

			expect(validator.isValid(null)).toBe(true);
			expect(validator.isValid(undefined)).toBe(false);
			expect(validator.isValid({ status: 'success', data: 'test' })).toBe(true);
		});

		it('should handle optional discriminated unions', () => {
			const validator = y
				.discriminatedUnion('status', [
					y.object({ status: y.literal('success'), data: y.string() }),
					y.object({ status: y.literal('failed'), error: y.string() })
				])
				.optional();

			expect(validator.isValid(undefined)).toBe(true);
			expect(validator.isValid(null)).toBe(false);
			expect(validator.isValid({ status: 'success', data: 'test' })).toBe(true);
		});
	});

	describe('Coercion and parsing', () => {
		it('should coerce valid values correctly', () => {
			const validator = y.discriminatedUnion('status', [
				y.object({ status: y.literal('success'), data: y.string() }),
				y.object({ status: y.literal('failed'), error: y.string() })
			]);

			const validInput = { status: 'success', data: 'Hello' };
			const coerced = validator.coerce(validInput);

			expect(coerced).toEqual(validInput);
		});

		it('should return null for invalid discriminants', () => {
			const validator = y.discriminatedUnion('status', [
				y.object({ status: y.literal('success'), data: y.string() }),
				y.object({ status: y.literal('failed'), error: y.string() })
			]);

			const invalidInput = { status: 'unknown', data: 'Hello' };
			const coerced = validator.coerce(invalidInput);

			expect(coerced).toBeNull();
		});

		it('should parse valid values correctly', () => {
			const validator = y.discriminatedUnion('status', [
				y.object({ status: y.literal('success'), data: y.string() }),
				y.object({ status: y.literal('failed'), error: y.string() })
			]);

			const validInput = { status: 'success', data: 'Hello' };
			const result = validator.parse(validInput);

			expect(result.isValid).toBe(true);
			expect(result.value).toEqual(validInput);
		});

		it('should parse invalid values correctly', () => {
			const validator = y.discriminatedUnion('status', [
				y.object({ status: y.literal('success'), data: y.string() }),
				y.object({ status: y.literal('failed'), error: y.string() })
			]);

			const invalidInput = { status: 'unknown', data: 'Hello' };
			const result = validator.parse(invalidInput);

			expect(result.isValid).toBe(false);
			expect(result.value).toBeNull();
		});
	});

	describe('Error handling', () => {
		it('should throw error if variants are not objects', () => {
			expect(() => {
				y.discriminatedUnion('type', [
					y.string() as any,
					y.object({ type: y.literal('object'), value: y.string() })
				]);
			}).toThrow('All discriminated union variants must be object validators');
		});

		it('should throw error if variants do not have discriminant key', () => {
			expect(() => {
				y.discriminatedUnion('status', [
					y.object({ type: y.literal('success'), data: y.string() }), // wrong key
					y.object({ status: y.literal('failed'), error: y.string() })
				]);
			}).toThrow('All variants must have the discriminant key "status" in their shape');
		});
	});

	describe('Default values', () => {
		it('should handle default values', () => {
			const defaultValue = { status: 'success', data: 'default' };
			const validator = y
				.discriminatedUnion('status', [
					y.object({ status: y.literal('success'), data: y.string() }),
					y.object({ status: y.literal('failed'), error: y.string() })
				])
				.default(defaultValue);

			expect(validator.coerce(null)).toEqual(defaultValue);
			expect(validator.coerce(undefined)).toEqual(defaultValue);
			expect(validator.coerce({ status: 'unknown' })).toEqual(defaultValue);
		});
	});
});
