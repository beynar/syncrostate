import { describe, it, expect } from 'vitest';
import { y } from '../../lib/schemas/schema.js';
import { NULL } from '$lib/constants.js';

describe('BooleanValidator', () => {
	describe('basic validation', () => {
		const schema = y.boolean();

		it('should validate boolean values', () => {
			expect(schema.isValid(true)).toBe(true);
			expect(schema.isValid(false)).toBe(true);
		});

		it('should reject non-boolean values', () => {
			expect(schema.isValid('true')).toBe(false);
			expect(schema.isValid('false')).toBe(false);
			expect(schema.isValid(1)).toBe(false);
			expect(schema.isValid(0)).toBe(false);
			expect(schema.isValid({})).toBe(false);
			expect(schema.isValid([])).toBe(false);
			expect(schema.isValid(null)).toBe(false);
			expect(schema.isValid(undefined)).toBe(false);
		});
	});

	describe('optional', () => {
		const schema = y.boolean().optional();

		it('should allow undefined when optional', () => {
			expect(schema.isValid(undefined)).toBe(true);
			expect(schema.isValid(true)).toBe(true);
			expect(schema.isValid(false)).toBe(true);
		});
	});

	describe('nullable', () => {
		const schema = y.boolean().nullable();

		it('should allow null when nullable', () => {
			expect(schema.isValid(null)).toBe(true);
			expect(schema.isValid(true)).toBe(true);
			expect(schema.isValid(false)).toBe(true);
		});
	});

	describe('parse', () => {
		const schema = y.boolean();

		it('should parse valid boolean strings', () => {
			expect(schema.parse('true')).toEqual({ isValid: true, value: true });
			expect(schema.parse('false')).toEqual({ isValid: true, value: false });
		});

		it('should handle invalid inputs', () => {
			expect(schema.parse('invalid')).toEqual({ isValid: false, value: null });
			expect(schema.parse(null)).toEqual({ isValid: false, value: null });
		});
	});

	describe('coercion', () => {
		const schema = y.boolean();

		it('should coerce string representations', () => {
			expect(schema.coerce('true')).toBe(true);
			expect(schema.coerce('false')).toBe(false);
		});

		it('should handle null and invalid inputs', () => {
			expect(schema.coerce(null)).toBe(null);
			expect(schema.coerce('invalid')).toBe(null);
			expect(schema.coerce('2')).toBe(null);
		});
	});

	describe('stringify', () => {
		const schema = y.boolean();

		it('should stringify boolean values correctly', () => {
			expect(schema.stringify(true)).toBe('true');
			expect(schema.stringify(false)).toBe('false');
		});

		it('should handle null and invalid inputs', () => {
			expect(schema.stringify(null)).toBe(NULL);
			expect(schema.stringify('invalid')).toBe(NULL);
		});
	});
});
