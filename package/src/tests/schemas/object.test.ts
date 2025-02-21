import { describe, it, expect } from 'vitest';
import { y } from '../../lib/schemas/schema.js';

describe('ObjectValidator', () => {
	describe('basic validation', () => {
		const schema = y.object({
			name: y.string(),
			age: y.number(),
			isActive: y.boolean()
		});

		it('should validate objects with correct types', () => {
			expect(
				schema.isValid({
					name: 'John',
					age: 30,
					isActive: true
				})
			).toBe(true);
		});

		it('should reject objects with incorrect types', () => {
			expect(
				schema.isValid({
					name: 123,
					age: '30',
					isActive: 1
				})
			).toBe(false);
		});

		it('should reject non-object values', () => {
			expect(schema.isValid(null)).toBe(false);
			expect(schema.isValid(undefined)).toBe(false);
			expect(schema.isValid('string')).toBe(false);
			expect(schema.isValid(123)).toBe(false);
			expect(schema.isValid([])).toBe(false);
		});

		it('should reject objects with missing required fields', () => {
			expect(
				schema.isValid({
					name: 'John',
					age: 30
				})
			).toBe(false);
		});
	});

	describe('optional fields', () => {
		const schema = y.object({
			name: y.string(),
			age: y.number().optional(),
			bio: y.string().optional()
		});

		it('should validate objects with optional fields present', () => {
			expect(
				schema.isValid({
					name: 'John',
					age: 30,
					bio: 'Developer'
				})
			).toBe(true);
		});

		it('should validate objects with optional fields missing', () => {
			expect(
				schema.isValid({
					name: 'John'
				})
			).toBe(true);
		});
	});

	describe('nullable fields', () => {
		const schema = y.object({
			name: y.string(),
			age: y.number().nullable(),
			bio: y.string().nullable()
		});

		it('should validate objects with null values in nullable fields', () => {
			expect(
				schema.isValid({
					name: 'John',
					age: null,
					bio: null
				})
			).toBe(true);
		});
	});

	describe('nested objects', () => {
		const schema = y.object({
			user: y.object({
				name: y.string(),
				contact: y.object({
					email: y.string(),
					phone: y.string().optional()
				})
			})
		});

		it('should validate nested objects with correct types', () => {
			expect(
				schema.isValid({
					user: {
						name: 'John',
						contact: {
							email: 'john@example.com',
							phone: '1234567890'
						}
					}
				})
			).toBe(true);
		});

		it('should reject nested objects with incorrect types', () => {
			expect(
				schema.isValid({
					user: {
						name: 'John',
						contact: {
							email: 123,
							phone: true
						}
					}
				})
			).toBe(false);
		});
	});

	describe('validation and coercion', () => {
		const schema = y.object({
			name: y.string(),
			age: y.number()
		});

		it('should validate and return valid objects', () => {
			const validObj = {
				name: 'John',
				age: 30
			};
			const { isValid, value } = schema.parse(validObj);
			expect(isValid).toBe(true);
			expect(value).toEqual(validObj);
		});

		it('should return null for invalid objects', () => {
			const { isValid, value } = schema.parse({
				name: 123,
				age: '30'
			});
			expect(isValid).toBe(false);
			expect(value).toBe(null);
		});
	});

	describe('optional object', () => {
		const schema = y
			.object({
				name: y.string(),
				age: y.number()
			})
			.optional();

		it('should allow undefined when optional', () => {
			expect(schema.isValid(undefined)).toBe(true);
		});

		it('should still validate object structure when present', () => {
			expect(
				schema.isValid({
					name: 'John',
					age: 30
				})
			).toBe(true);

			expect(
				schema.isValid({
					name: 'John'
				})
			).toBe(false);
		});
	});

	describe('nullable object', () => {
		const schema = y
			.object({
				name: y.string(),
				age: y.number()
			})
			.nullable();

		it('should allow null when nullable', () => {
			expect(schema.isValid(null)).toBe(true);
		});

		it('should still validate object structure when present', () => {
			expect(
				schema.isValid({
					name: 'John',
					age: 30
				})
			).toBe(true);

			expect(
				schema.isValid({
					name: 'John'
				})
			).toBe(false);
		});
	});
});
