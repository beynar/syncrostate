import { test, expect } from 'vitest';
import { y } from './src/lib/schemas/schema.js';

test('debug variant validator construction', () => {
	// Test the new API
	const discUnion = y.discriminatedUnion('status', {
		success: {
			data: y.string()
		},
		error: {
			message: y.string()
		}
	});

	console.log('Discriminated Union Schema:', discUnion.$schema);
	console.log('Variant Validators:', discUnion.$schema.variantValidators);

	// Look at the first variant (success)
	const successVariant = discUnion.$schema.variantValidators[0];
	console.log('Success Variant Schema:', successVariant.$schema);
	console.log('Success Variant Shape:', successVariant.$schema.shape);
	console.log('Shape keys:', Object.keys(successVariant.$schema.shape));

	// Check each property in the shape
	Object.entries(successVariant.$schema.shape).forEach(([key, validator]) => {
		console.log(`Property "${key}":`, validator);
		console.log(`Property "${key}" $schema:`, validator?.$schema);
	});

	expect(discUnion).toBeDefined();
});
