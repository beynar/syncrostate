import { describe, it, expect } from 'vitest';
import { LiteralValidator } from '../../lib/schemas/literal.js';
import { NULL } from '../../lib/constants.js';

describe('LiteralValidator', () => {
	describe('Basic functionality', () => {
		it('should validate exact string literal values', () => {
			const validator = new LiteralValidator('success');

			expect(validator.isValid('success')).toBe(true);
			expect(validator.isValid('failure')).toBe(false);
			expect(validator.isValid('SUCCESS')).toBe(false);
			expect(validator.isValid('')).toBe(false);
		});

		it('should validate exact number literal values', () => {
			const validator = new LiteralValidator(42);

			expect(validator.isValid(42)).toBe(true);
			expect(validator.isValid(0)).toBe(false);
			expect(validator.isValid('42')).toBe(false);
			expect(validator.isValid(42.0)).toBe(true);
		});

		it('should validate exact boolean literal values', () => {
			const trueValidator = new LiteralValidator(true);
			const falseValidator = new LiteralValidator(false);

			expect(trueValidator.isValid(true)).toBe(true);
			expect(trueValidator.isValid(false)).toBe(false);
			expect(trueValidator.isValid('true')).toBe(false);
			expect(trueValidator.isValid(1)).toBe(false);

			expect(falseValidator.isValid(false)).toBe(true);
			expect(falseValidator.isValid(true)).toBe(false);
			expect(falseValidator.isValid('false')).toBe(false);
			expect(falseValidator.isValid(0)).toBe(false);
		});
	});

	describe('Nullability and optionality', () => {
		it('should handle nullable literals', () => {
			const validator = new LiteralValidator('test').nullable();

			expect(validator.isValid('test')).toBe(true);
			expect(validator.isValid(null)).toBe(true);
			expect(validator.isValid(undefined)).toBe(false);
			expect(validator.isValid('other')).toBe(false);
		});

		it('should handle optional literals', () => {
			const validator = new LiteralValidator('test').optional();

			expect(validator.isValid('test')).toBe(true);
			expect(validator.isValid(undefined)).toBe(true);
			expect(validator.isValid(null)).toBe(false);
			expect(validator.isValid('other')).toBe(false);
		});

		it('should handle both nullable and optional', () => {
			const validator = new LiteralValidator('test').nullable().optional();

			expect(validator.isValid('test')).toBe(true);
			expect(validator.isValid(null)).toBe(true);
			expect(validator.isValid(undefined)).toBe(true);
			expect(validator.isValid('other')).toBe(false);
		});
	});

	describe('Coercion and parsing', () => {
		it('should coerce values correctly', () => {
			const validator = new LiteralValidator('success');

			expect(validator.coerce('success')).toBe('success');
			expect(validator.coerce('failure')).toBe('success');
			expect(validator.coerce(null)).toBe('success');
			expect(validator.coerce(undefined)).toBe('success');
		});

		it('should coerce nullable values correctly', () => {
			const validator = new LiteralValidator('success').nullable();

			expect(validator.coerce('success')).toBe('success');
			expect(validator.coerce('failure')).toBe(null);
			expect(validator.coerce(null)).toBe(null);
			expect(validator.coerce(undefined)).toBe(null);
		});

		it('should parse values correctly', () => {
			const validator = new LiteralValidator('success');

			const validResult = validator.parse('success');
			expect(validResult.isValid).toBe(true);
			expect(validResult.value).toBe('success');

			const invalidResult = validator.parse('failure');
			expect(invalidResult.isValid).toBe(false);
			expect(invalidResult.value).toBe('success'); // coerced to literal value
		});
	});

	describe('Default values', () => {
		it('should handle default values', () => {
			const validator = new LiteralValidator('success').default('default-success');

			expect(validator.coerce(null)).toBe('default-success');
			expect(validator.coerce(undefined)).toBe('default-success');
			expect(validator.coerce('failure')).toBe('default-success');
			expect(validator.coerce('success')).toBe('success');
		});
	});

	describe('Stringify', () => {
		it('should stringify valid values', () => {
			const validator = new LiteralValidator('success');

			expect(validator.stringify('success')).toBe('success');
			expect(validator.stringify('failure')).toBe('success');
		});

		it('should stringify nullable values', () => {
			const validator = new LiteralValidator('success').nullable();

			expect(validator.stringify('success')).toBe('success');
			expect(validator.stringify(null)).toBe(NULL);
		});
	});
});
