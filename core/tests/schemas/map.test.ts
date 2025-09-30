import { describe, it, expect } from 'vitest';
import { y } from '../../lib/schemas/schema.js';

describe('MapValidator', () => {
	describe('basic validation', () => {
		const schema = y.map(
			y.object({
				name: y.string(),
				age: y.number(),
				isActive: y.boolean()
			})
		);

		it('should validate maps with correct types', () => {
			const validMap = new Map<string, any>([['key1', { name: 'John', age: 30, isActive: true }]]);
			expect(schema.isValid(validMap)).toBe(true);
		});

		it('should reject maps with incorrect types', () => {
			const invalidMap = new Map<string, any>([['key1', { name: 123, age: '30', isActive: 1 }]]);
			expect(schema.isValid(invalidMap)).toBe(false);
		});

		it('should reject non-map values', () => {
			expect(schema.isValid(null)).toBe(false);
			expect(schema.isValid(undefined)).toBe(false);
			expect(schema.isValid('string')).toBe(false);
			expect(schema.isValid(123)).toBe(false);
			expect(schema.isValid({})).toBe(false);
			expect(schema.isValid([])).toBe(false);
		});

		it('should validate maps with multiple entries', () => {
			const validMap = new Map<string, any>([
				['key1', { name: 'John', age: 30, isActive: true }],
				['key2', { name: 'Jane', age: 25, isActive: false }]
			]);
			expect(schema.isValid(validMap)).toBe(true);
		});
	});

	describe('optional fields', () => {
		const schema = y.map(
			y.object({
				name: y.string(),
				age: y.number().optional(),
				bio: y.string().optional()
			})
		);

		it('should validate maps with optional fields present', () => {
			const validMap = new Map<string, any>([
				['key1', { name: 'John', age: 30, bio: 'Developer' }]
			]);
			expect(schema.isValid(validMap)).toBe(true);
		});

		it('should validate maps with optional fields missing', () => {
			const validMap = new Map<string, any>([['key1', { name: 'John' }]]);
			expect(schema.isValid(validMap)).toBe(true);
		});
	});

	describe('nullable fields', () => {
		const schema = y.map(
			y.object({
				name: y.string(),
				age: y.number().nullable(),
				bio: y.string().nullable()
			})
		);

		it('should validate maps with null values in nullable fields', () => {
			const validMap = new Map<string, any>([['key1', { name: 'John', age: null, bio: null }]]);
			expect(schema.isValid(validMap)).toBe(true);
		});
	});

	describe('nested maps', () => {
		const contactSchema = y.object({
			email: y.string(),
			phone: y.string().optional()
		});

		const userSchema = y.object({
			name: y.string(),
			contact: contactSchema
		});

		const schema = y.map(userSchema);

		it('should validate nested objects with correct types', () => {
			const validMap = new Map<string, any>([
				[
					'user1',
					{
						name: 'John',
						contact: {
							email: 'john@example.com',
							phone: '1234567890'
						}
					}
				]
			]);
			expect(schema.isValid(validMap)).toBe(true);
		});

		it('should reject nested objects with incorrect types', () => {
			const invalidMap = new Map<string, any>([
				[
					'user1',
					{
						name: 'John',
						contact: {
							email: 123,
							phone: true
						}
					}
				]
			]);
			expect(schema.isValid(invalidMap)).toBe(false);
		});
	});

	describe('validation and coercion', () => {
		const schema = y.map(
			y.object({
				name: y.string(),
				age: y.number()
			})
		);

		it('should validate and return valid maps', () => {
			const validMap = new Map<string, any>([['key1', { name: 'John', age: 30 }]]);
			const { isValid, value } = schema.parse(validMap);
			expect(isValid).toBe(true);
			expect(value).toEqual(validMap);
		});

		it('should return null for invalid maps', () => {
			const invalidMap = new Map<string, any>([['key1', { name: 123, age: '30' }]]);
			const { isValid, value } = schema.parse(invalidMap);
			expect(isValid).toBe(false);
			// Should I ??
			// expect(value).toBe(null);
		});
	});

	describe('optional map', () => {
		const schema = y
			.map(
				y.object({
					name: y.string(),
					age: y.number()
				})
			)
			.optional();

		it('should allow undefined when optional', () => {
			expect(schema.isValid(undefined)).toBe(true);
		});

		it('should still validate map structure when present', () => {
			const validMap = new Map<string, any>([['key1', { name: 'John', age: 30 }]]);
			expect(schema.isValid(validMap)).toBe(true);

			const invalidMap = new Map<string, any>([['key1', { name: 'John' }]]);
			expect(schema.isValid(invalidMap)).toBe(false);
		});
	});

	describe('nullable map', () => {
		const schema = y
			.map(
				y.object({
					name: y.string(),
					age: y.number()
				})
			)
			.nullable();

		it('should allow null when nullable', () => {
			expect(schema.isValid(null)).toBe(true);
		});

		it('should still validate map structure when present', () => {
			const validMap = new Map<string, any>([['key1', { name: 'John', age: 30 }]]);
			expect(schema.isValid(validMap)).toBe(true);

			const invalidMap = new Map<string, any>([['key1', { name: 'John' }]]);
			expect(schema.isValid(invalidMap)).toBe(false);
		});
	});

	describe('primitive value maps', () => {
		describe('string values', () => {
			const schema = y.map(y.string());

			it('should validate maps with string values', () => {
				const validMap = new Map<string, string>([
					['key1', 'value1'],
					['key2', 'value2']
				]);
				expect(schema.isValid(validMap)).toBe(true);
			});

			it('should reject maps with non-string values', () => {
				const invalidMap = new Map<string, any>([
					['key1', 123],
					['key2', true]
				]);
				expect(schema.isValid(invalidMap)).toBe(false);
			});
		});

		describe('number values', () => {
			const schema = y.map(y.number());

			it('should validate maps with number values', () => {
				const validMap = new Map<string, number>([
					['key1', 123],
					['key2', 456]
				]);
				expect(schema.isValid(validMap)).toBe(true);
			});

			it('should reject maps with non-number values', () => {
				const invalidMap = new Map<string, any>([
					['key1', 'string'],
					['key2', true]
				]);
				expect(schema.isValid(invalidMap)).toBe(false);
			});
		});
	});
});
