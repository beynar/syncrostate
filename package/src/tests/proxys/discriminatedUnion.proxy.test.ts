import { describe, it, expect, beforeEach } from 'vitest';
import * as Y from 'yjs';
import { SyncedDiscriminatedUnion } from '../../lib/proxys/discriminatedUnion.svelte.js';
import { y } from '../../lib/schemas/schema.js';
import type { State } from '../../lib/proxys/syncroState.svelte.js';

// Mock State for testing
const createMockState = (): State => {
	const doc = new Y.Doc();
	const transactionKey = 'test-transaction';

	return {
		doc,
		awareness: null as any,
		isInitialized: { value: true },
		isConnected: { value: true },
		transactionKey,
		transaction: (fn: () => void) => {
			doc.transact(fn, transactionKey);
		},
		undo: () => {},
		redo: () => {},
		canUndo: { value: false },
		canRedo: { value: false },
		presence: null as any
	};
};

// Mock parent container
const createMockParent = (yDoc: Y.Doc) => ({
	yType: yDoc.getMap('root'),
	deleteProperty: () => true
});

describe('SyncedDiscriminatedUnion', () => {
	let yDoc: Y.Doc;
	let mockState: State;
	let mockParent: ReturnType<typeof createMockParent>;

	beforeEach(() => {
		yDoc = new Y.Doc();
		mockState = createMockState();
		// IMPORTANT: Use the same document for state and yType!
		mockState.doc = yDoc;
		mockParent = createMockParent(yDoc);
	});

	describe('Basic functionality', () => {
		it('should create a discriminated union proxy', () => {
			const validator = y.discriminatedUnion('status', [
				y.object({ status: y.literal('success'), data: y.string() }),
				y.object({ status: y.literal('failed'), error: y.string() })
			]);

			const yType = yDoc.getMap('test');
			const syncedUnion = new SyncedDiscriminatedUnion({
				state: mockState,
				validator,
				yType,
				parent: mockParent,
				key: 'test',
				observe: false
			});

			expect(syncedUnion).toBeDefined();
			expect(syncedUnion.validator).toBe(validator);
			expect(syncedUnion.currentVariant).toBe(validator.$schema.variantValidators[0]);
		});

		it('should set and get success variant values', () => {
			const validator = y.discriminatedUnion('status', [
				y.object({ status: y.literal('success'), data: y.string() }),
				y.object({ status: y.literal('failed'), error: y.string() })
			]);

			const yType = yDoc.getMap('test');
			const syncedUnion = new SyncedDiscriminatedUnion({
				state: mockState,
				validator,
				yType,
				parent: mockParent,
				key: 'test',
				observe: false
			});

			const successValue = { status: 'success', data: 'Hello world' };
			syncedUnion.value = successValue;

			expect(syncedUnion.currentVariant).toBeTruthy();
			expect(syncedUnion.value.status).toBe('success');
			expect(syncedUnion.value.data).toBe('Hello world');
		});

		it('should set and get failed variant values', () => {
			const validator = y.discriminatedUnion('status', [
				y.object({ status: y.literal('success'), data: y.string() }),
				y.object({ status: y.literal('failed'), error: y.string() })
			]);

			const yType = yDoc.getMap('test');
			const syncedUnion = new SyncedDiscriminatedUnion({
				state: mockState,
				validator,
				yType,
				parent: mockParent,
				key: 'test',
				observe: false
			});

			const failedValue = { status: 'failed', error: 'Something went wrong' };
			syncedUnion.value = failedValue;

			expect(syncedUnion.currentVariant).toBeTruthy();
			expect(syncedUnion.value.status).toBe('failed');
			expect(syncedUnion.value.error).toBe('Something went wrong');
		});
	});

	describe('Variant switching', () => {
		it('should switch variants when discriminant changes', () => {
			const validator = y.discriminatedUnion('status', [
				y.object({ status: y.literal('success'), data: y.string() }),
				y.object({ status: y.literal('failed'), error: y.string() })
			]);

			const yType = yDoc.getMap('test');
			const syncedUnion = new SyncedDiscriminatedUnion({
				state: mockState,
				validator,
				yType,
				parent: mockParent,
				key: 'test',
				observe: true
			});

			// Start with success
			const successValue = { status: 'success', data: 'Hello world' };
			syncedUnion.value = successValue;

			const initialVariant = syncedUnion.currentVariant;
			expect(syncedUnion.value.status).toBe('success');
			expect(syncedUnion.value.data).toBe('Hello world');

			// Switch to failed
			const failedValue = { status: 'failed', error: 'Something went wrong' };
			syncedUnion.value = failedValue;

			// Check that the value changed correctly (most important)
			expect(syncedUnion.value.status).toBe('failed');
			expect(syncedUnion.value.error).toBe('Something went wrong');
			// The discriminant should not have data property anymore
			expect(syncedUnion.value.data).toBeUndefined();
		});

		it('should handle property updates within the same variant', () => {
			const validator = y.discriminatedUnion('status', [
				y.object({ status: y.literal('success'), data: y.string() }),
				y.object({ status: y.literal('failed'), error: y.string() })
			]);

			const yType = yDoc.getMap('test');
			const syncedUnion = new SyncedDiscriminatedUnion({
				state: mockState,
				validator,
				yType,
				parent: mockParent,
				key: 'test',
				observe: false
			});

			// Set initial value
			syncedUnion.value = { status: 'success', data: 'Initial data' };
			const initialVariant = syncedUnion.currentVariant;

			// Update data property
			syncedUnion.value.data = 'Updated data';

			expect(syncedUnion.currentVariant).toBe(initialVariant); // Same variant
			expect(syncedUnion.value.status).toBe('success');
			expect(syncedUnion.value.data).toBe('Updated data');
		});
	});

	describe('Null and undefined handling', () => {
		it('should handle null values for nullable unions', () => {
			const validator = y
				.discriminatedUnion('status', [
					y.object({ status: y.literal('success'), data: y.string() }),
					y.object({ status: y.literal('failed'), error: y.string() })
				])
				.nullable();

			const yType = yDoc.getMap('test');
			const syncedUnion = new SyncedDiscriminatedUnion({
				state: mockState,
				validator,
				yType,
				parent: mockParent,
				key: 'test',
				observe: false
			});

			syncedUnion.value = null;
			expect(syncedUnion.isNull).toBe(true);
			expect(syncedUnion.value).toBeNull();
		});

		it('should handle undefined values for optional unions', () => {
			const validator = y
				.discriminatedUnion('status', [
					y.object({ status: y.literal('success'), data: y.string() }),
					y.object({ status: y.literal('failed'), error: y.string() })
				])
				.optional();

			const yType = yDoc.getMap('test');
			const syncedUnion = new SyncedDiscriminatedUnion({
				state: mockState,
				validator,
				yType,
				parent: mockParent,
				key: 'test',
				observe: false
			});

			// This should trigger parent deletion for undefined values
			syncedUnion.value = undefined;
			// Note: In a real scenario, this would delete the property from parent
		});
	});

	describe('JSON serialization', () => {
		it('should serialize to JSON correctly', () => {
			const validator = y.discriminatedUnion('status', [
				y.object({ status: y.literal('success'), data: y.string() }),
				y.object({ status: y.literal('failed'), error: y.string() })
			]);

			const yType = yDoc.getMap('test');
			const syncedUnion = new SyncedDiscriminatedUnion({
				state: mockState,
				validator,
				yType,
				parent: mockParent,
				key: 'test',
				observe: true
			});

			const successValue = { status: 'success', data: 'Hello world' };
			syncedUnion.value = successValue;

			const json = syncedUnion.toJSON();
			expect(json).toEqual(successValue);
		});

		it('should return null for null unions', () => {
			const validator = y
				.discriminatedUnion('status', [
					y.object({ status: y.literal('success'), data: y.string() }),
					y.object({ status: y.literal('failed'), error: y.string() })
				])
				.nullable();

			const yType = yDoc.getMap('test');
			const syncedUnion = new SyncedDiscriminatedUnion({
				state: mockState,
				validator,
				yType,
				parent: mockParent,
				key: 'test',
				observe: false
			});

			syncedUnion.value = null;
			const json = syncedUnion.toJSON();
			expect(json).toBeNull();
		});
	});

	describe('Proxy behavior', () => {
		it('should support property access through proxy', () => {
			const validator = y.discriminatedUnion('status', [
				y.object({ status: y.literal('success'), data: y.string() }),
				y.object({ status: y.literal('failed'), error: y.string() })
			]);

			const yType = yDoc.getMap('test');
			const syncedUnion = new SyncedDiscriminatedUnion({
				state: mockState,
				validator,
				yType,
				parent: mockParent,
				key: 'test',
				observe: false
			});

			syncedUnion.value = { status: 'success', data: 'Hello world' };

			// Access through proxy
			expect(syncedUnion.proxy.status).toBe('success');
			expect(syncedUnion.proxy.data).toBe('Hello world');
		});

		it('should support property enumeration', () => {
			const validator = y.discriminatedUnion('status', [
				y.object({ status: y.literal('success'), data: y.string() }),
				y.object({ status: y.literal('failed'), error: y.string() })
			]);

			const yType = yDoc.getMap('test');
			const syncedUnion = new SyncedDiscriminatedUnion({
				state: mockState,
				validator,
				yType,
				parent: mockParent,
				key: 'test',
				observe: true
			});

			syncedUnion.value = { status: 'success', data: 'Hello world' };

			const keys = Object.keys(syncedUnion.value);

			expect(keys).toContain('status');
			expect(keys).toContain('data');
		});
	});

	describe('Cleanup', () => {
		it('should cleanup resources on destroy', () => {
			const validator = y
				.discriminatedUnion('status', [
					y.object({ status: y.literal('success'), data: y.string() }),
					y.object({ status: y.literal('failed'), error: y.string() })
				])
				.default({ status: 'success', data: 'Hello world' });

			const yType = yDoc.getMap('test');
			const syncedUnion = new SyncedDiscriminatedUnion({
				state: mockState,
				validator,
				yType,
				parent: mockParent,
				key: 'test',
				observe: false
			});

			syncedUnion.value = { status: 'success', data: 'Hello world' };
			expect(syncedUnion.currentObjectProxy).not.toBeNull();

			syncedUnion.destroy();
			expect(syncedUnion.currentObjectProxy).toBeNull();
			expect(syncedUnion.currentVariant).toBeNull();
		});
	});
});
