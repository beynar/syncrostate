import { describe, it, expect } from 'vitest';
import { y } from '$lib/schemas/schema.js';
import { NULL } from '$lib/constants.js';

describe('String Schema', () => {
	// Basic validation tests
	describe('basic validation', () => {
		const schema = y.string();

		it('should validate string values', () => {
			expect(schema.validate('hello')).toBe('hello');
			expect(schema.validate('')).toBe('');
		});

		it('should reject non-string values', () => {
			expect(schema.validate(123)).toBeNull();
			expect(schema.validate(true)).toBeNull();
			expect(schema.validate({})).toBeNull();
			expect(schema.validate([])).toBeNull();
			expect(schema.validate(null)).toBeNull();
			expect(schema.validate(undefined)).toBeNull();
		});
	});

	// Optional tests
	describe('optional', () => {
		const schema = y.string().optional();

		it('should allow undefined values', () => {
			expect(schema.validate(undefined)).toBeNull();
		});

		it('should still validate string values', () => {
			expect(schema.validate('test')).toBe('test');
		});
	});

	// Nullable tests
	describe('nullable', () => {
		const schema = y.string().nullable();

		it('should allow null values', () => {
			expect(schema.validate(null)).toBeNull();
		});

		it('should still validate string values', () => {
			expect(schema.validate('test')).toBe('test');
		});
	});

	// Min length tests
	describe('min length', () => {
		const schema = y.string().min(3);

		it('should validate strings with length >= min', () => {
			expect(schema.validate('hello')).toBe('hello');
			expect(schema.validate('hey')).toBe('hey');
		});

		it('should reject strings with length < min', () => {
			expect(schema.validate('hi')).toBeNull();
			expect(schema.validate('')).toBeNull();
		});
	});

	// Max length tests
	describe('max length', () => {
		const schema = y.string().max(5);

		it('should validate strings with length <= max', () => {
			expect(schema.validate('hello')).toBe('hello');
			expect(schema.validate('hi')).toBe('hi');
		});

		it('should reject strings with length > max', () => {
			expect(schema.validate('hello world')).toBeNull();
			expect(schema.validate('123456')).toBeNull();
		});
	});

	// Pattern tests
	describe('pattern', () => {
		const schema = y.string().pattern(/^[A-Z]+$/);

		it('should validate strings matching the pattern', () => {
			expect(schema.validate('ABC')).toBe('ABC');
			expect(schema.validate('HELLO')).toBe('HELLO');
		});

		it('should reject strings not matching the pattern', () => {
			expect(schema.validate('abc')).toBeNull();
			expect(schema.validate('123')).toBeNull();
			expect(schema.validate('Hello')).toBeNull();
		});
	});

	// Combined constraints tests
	describe('combined constraints', () => {
		const schema = y
			.string()
			.min(3)
			.max(5)
			.pattern(/^[A-Z]+$/);

		it('should validate strings meeting all constraints', () => {
			expect(schema.validate('HELLO')).toBe('HELLO');
			expect(schema.validate('ABC')).toBe('ABC');
		});

		it('should reject strings failing any constraint', () => {
			expect(schema.validate('AB')).toBeNull(); // too short
			expect(schema.validate('ABCDEF')).toBeNull(); // too long
			expect(schema.validate('Hello')).toBeNull(); // wrong pattern
		});
	});

	// Default value tests
	describe('default value', () => {
		const schema = y.string().default('default');

		it('should return the default value when coercing undefined', () => {
			expect(schema.coerce(undefined)).toBe('default');
		});

		it('should still validate normal strings', () => {
			expect(schema.validate('test')).toBe('test');
		});
	});

	// Coercion tests
	describe('coercion', () => {
		const schema = y.string();

		it('should coerce valid strings', () => {
			expect(schema.coerce('hello')).toBe('hello');
		});

		it('should return null for invalid values', () => {
			expect(schema.coerce(123)).toBeNull();
			expect(schema.coerce(null)).toBeNull();
			expect(schema.coerce(undefined)).toBeNull();
		});
	});

	// Add after the existing pattern tests
	describe('pattern matching', () => {
		describe('email pattern', () => {
			const emailSchema = y.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

			it('should validate valid email addresses', () => {
				expect(emailSchema.validate('test@example.com')).toBe('test@example.com');
				expect(emailSchema.validate('user.name@domain.co.uk')).toBe('user.name@domain.co.uk');
				expect(emailSchema.validate('user+label@domain.com')).toBe('user+label@domain.com');
			});

			it('should reject invalid email addresses', () => {
				expect(emailSchema.validate('not-an-email')).toBeNull();
				expect(emailSchema.validate('missing@domain')).toBeNull();
				expect(emailSchema.validate('@domain.com')).toBeNull();
				expect(emailSchema.validate('spaces in@email.com')).toBeNull();
			});
		});

		describe('phone number pattern', () => {
			const phoneSchema = y.string().pattern(/^\+?[\d\s-]{10,}$/);

			it('should validate valid phone numbers', () => {
				expect(phoneSchema.validate('+1-555-555-5555')).toBe('+1-555-555-5555');
				expect(phoneSchema.validate('1234567890')).toBe('1234567890');
				expect(phoneSchema.validate('+44 20 7123 4567')).toBe('+44 20 7123 4567');
			});

			it('should reject invalid phone numbers', () => {
				expect(phoneSchema.validate('123')).toBeNull();
				expect(phoneSchema.validate('abc-def-ghij')).toBeNull();
				expect(phoneSchema.validate('12345@67890')).toBeNull();
			});
		});

		describe('url pattern', () => {
			const urlSchema = y.string().pattern(/^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/);

			it('should validate valid URLs', () => {
				expect(urlSchema.validate('https://example.com')).toBe('https://example.com');
				expect(urlSchema.validate('http://sub.domain.com/path')).toBe('http://sub.domain.com/path');
				expect(urlSchema.validate('https://site.com?param=value')).toBe(
					'https://site.com?param=value'
				);
			});

			it('should reject invalid URLs', () => {
				expect(urlSchema.validate('not-a-url')).toBeNull();
				expect(urlSchema.validate('ftp://example.com')).toBeNull();
				expect(urlSchema.validate('https:/missing-slash.com')).toBeNull();
			});
		});
	});
});

describe('stringify', () => {
	describe('basic stringify', () => {
		const schema = y.string();

		it('should stringify valid strings', () => {
			expect(schema.stringify('hello')).toBe('hello');
			expect(schema.stringify('')).toBe('');
		});

		it('should return empty string for invalid values', () => {
			expect(schema.stringify(123)).toBe('');
			expect(schema.stringify(true)).toBe('');
			expect(schema.stringify({})).toBe('');
			expect(schema.stringify([])).toBe('');
		});

		it('should return "__NULL__" for null values', () => {
			expect(schema.stringify(null)).toBe(NULL);
		});

		it('should return empty string for undefined values', () => {
			expect(schema.stringify(undefined)).toBe('');
		});
	});

	describe('stringify with default value', () => {
		const schema = y.string().default('default-value');

		it('should use default value for undefined', () => {
			expect(schema.stringify(undefined)).toBe('default-value');
		});

		it('should still stringify valid strings', () => {
			expect(schema.stringify('hello')).toBe('hello');
		});
	});

	describe('stringify with pattern', () => {
		const schema = y.string().pattern(/^[A-Z]+$/);

		it('should stringify valid pattern matches', () => {
			expect(schema.stringify('ABC')).toBe('ABC');
		});

		it('should return empty string for pattern mismatches', () => {
			expect(schema.stringify('abc')).toBe('');
			expect(schema.stringify('123')).toBe('');
		});
	});

	describe('stringify with length constraints', () => {
		const schema = y.string().min(3).max(5);

		it('should stringify valid length strings', () => {
			expect(schema.stringify('hello')).toBe('hello');
			expect(schema.stringify('hey')).toBe('hey');
		});

		it('should return empty string for invalid length strings', () => {
			expect(schema.stringify('hi')).toBe(''); // too short
			expect(schema.stringify('hello world')).toBe(''); // too long
		});
	});

	describe('stringify with nullable', () => {
		const schema = y.string().nullable();

		it('should return "__NULL__" for null values', () => {
			expect(schema.stringify(null)).toBe(NULL);
		});

		it('should stringify valid strings', () => {
			expect(schema.stringify('hello')).toBe('hello');
		});
	});

	describe('stringify with optional', () => {
		const schema = y.string().optional();

		it('should return empty string for undefined values', () => {
			expect(schema.stringify(undefined)).toBe('');
		});

		it('should stringify valid strings', () => {
			expect(schema.stringify('hello')).toBe('hello');
		});
	});

	describe('stringify with combined constraints', () => {
		const schema = y
			.string()
			.min(3)
			.max(5)
			.pattern(/^[A-Z]+$/)
			.default('DEFAULT');

		it('should stringify valid values meeting all constraints', () => {
			expect(schema.stringify('HELLO')).toBe('HELLO');
			expect(schema.stringify('ABC')).toBe('ABC');
		});

		it('should return empty string for values failing any constraint', () => {
			expect(schema.stringify('ab')).toBe('DEFAULT'); // too short
			expect(schema.stringify('ABCDEF')).toBe('DEFAULT'); // too long
			expect(schema.stringify('hello')).toBe('DEFAULT'); // wrong pattern
		});

		it('should use default value for undefined', () => {
			expect(schema.stringify(undefined)).toBe('DEFAULT');
		});
	});
});
