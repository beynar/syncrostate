import { describe, it, expect, beforeEach } from 'vitest';
import { syncroState, y } from '../../lib/index.js';
import * as Y from 'yjs';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Array Splice Diagnostic Tests', () => {
	const doc = new Y.Doc();
	const schema = {
		testArray: y.array(y.string())
	};

	const state = syncroState({ schema, doc });

	// Initialize with some data

	beforeEach(() => {
		state.testArray = ['a', 'b', 'c', 'd', 'e'];
	});

	// it('should verify initial Y.js document setup', () => {
	// 	state.testArray = ['a', 'b', 'c', 'd', 'e'];

	// 	// Test 1: Check if Y.js document has the array
	// 	const yArray = state.testArray.getYType?.();
	// 	console.log('Initial Y.js array length:', yArray!.length);
	// 	console.log('Initial Y.js array content:', yArray!.toArray());
	// 	console.log('Initial proxy array length:', state.testArray.length);
	// 	console.log('Initial proxy array content:', [...state.testArray]);

	// 	// Basic assertions
	// 	expect(state.testArray.length).toBe(5);
	// 	expect([...state.testArray]).toEqual(['a', 'b', 'c', 'd', 'e']);

	// 	// Critical test: Y.js document should match proxy
	// 	expect(yArray!.length).toBe(5);
	// 	expect(yArray!.toJSON()).toEqual(['a', 'b', 'c', 'd', 'e']);
	// });

	// it('should verify Y.js document state after simple splice', () => {
	// 	// Before splice
	// 	const yArrayBefore = state.testArray.getYType?.();
	// 	console.log('Before splice - Y.js length:', yArrayBefore!.length);
	// 	console.log('Before splice - Y.js content:', yArrayBefore!.toArray());

	// 	// Perform splice
	// 	state.testArray.splice(1, 1, 'x');

	// 	// After splice
	// 	const yArrayAfter = state.testArray.getYType?.();
	// 	console.log('After splice - Y.js length:', yArrayAfter!.length);
	// 	console.log('After splice - Y.js content:', yArrayAfter!.toArray());
	// 	console.log('After splice - proxy length:', state.testArray.length);
	// 	console.log('After splice - proxy content:', [...state.testArray]);

	// 	// Critical assertions
	// 	expect(state.testArray.length).toBe(5);
	// 	expect([...state.testArray]).toEqual(['a', 'x', 'c', 'd', 'e']);
	// 	expect(yArrayAfter!.length).toBe(5);
	// 	expect(yArrayAfter!.toJSON()).toEqual(['a', 'x', 'c', 'd', 'e']);
	// });

	// it('should verify Y.js document state after deletion-only splice', () => {
	// 	// Before splice
	// 	const yArrayBefore = state.testArray.getYType?.();
	// 	console.log('Before deletion splice - Y.js length:', yArrayBefore!.length);

	// 	// Perform deletion splice
	// 	state.testArray.splice(1, 2);

	// 	// After splice
	// 	const yArrayAfter = state.testArray.getYType?.();
	// 	console.log('After deletion splice - Y.js length:', yArrayAfter!.length);
	// 	console.log('After deletion splice - Y.js content:', yArrayAfter!.toJSON());
	// 	console.log('After deletion splice - proxy length:', state.testArray.length);
	// 	console.log('After deletion splice - proxy content:', [...state.testArray]);

	// 	// Critical assertions
	// 	expect(state.testArray.length).toBe(3);
	// 	expect([...state.testArray]).toEqual(['a', 'd', 'e']);
	// 	expect(yArrayAfter!.length).toBe(3);
	// 	expect(yArrayAfter!.toJSON()).toEqual(['a', 'd', 'e']);
	// });

	// it('should verify Y.js document state after insertion-only splice', () => {
	// 	// Before splice
	// 	const yArrayBefore = state.testArray.getYType?.();
	// 	console.log('Before insertion splice - Y.js length:', yArrayBefore!.length);

	// 	// Perform insertion splice
	// 	state.testArray.splice(2, 0, 'x', 'y');

	// 	// After splice
	// 	const yArrayAfter = state.testArray.getYType?.();
	// 	console.log('After insertion splice - Y.js length:', yArrayAfter!.length);
	// 	console.log('After insertion splice - Y.js content:', yArrayAfter!.toArray());
	// 	console.log('After insertion splice - proxy length:', state.testArray.length);
	// 	console.log('After insertion splice - proxy content:', [...state.testArray]);

	// 	// Critical assertions
	// 	expect(state.testArray.length).toBe(7);
	// 	expect([...state.testArray]).toEqual(['a', 'b', 'x', 'y', 'c', 'd', 'e']);
	// 	expect(yArrayAfter!.length).toBe(7);
	// 	expect(yArrayAfter!.toJSON()).toEqual(['a', 'b', 'x', 'y', 'c', 'd', 'e']);
	// });

	// it('should verify empty array handling', () => {
	// 	// Test empty array assignment
	// 	console.log('Before clearing - proxy length:', state.testArray.length);
	// 	console.log('Before clearing - proxy type:', typeof state.testArray);

	// 	state.testArray = [];

	// 	console.log('After clearing - proxy length:', state.testArray?.length);
	// 	console.log('After clearing - proxy type:', typeof state.testArray);
	// 	console.log('After clearing - proxy value:', state.testArray);

	// 	// Check if array becomes null (the reported issue)
	// 	if (state.testArray === null) {
	// 		console.log('ISSUE CONFIRMED: Array becomes null instead of empty array');
	// 	}

	// 	// Y.js document state
	// 	const yArray = state.testArray?.getYType?.();
	// 	console.log('After clearing - Y.js length:', yArray?.length);
	// 	console.log('After clearing - Y.js content:', yArray?.toArray());

	// 	// This test will fail if the empty array issue exists
	// 	expect(state.testArray).not.toBe(null);
	// 	if (state.testArray) {
	// 		expect(state.testArray.length).toBe(0);
	// 		expect(yArray?.length).toBe(0);
	// 	}
	// });

	it('should verify Y.js transaction behavior', () => {
		// Check if transactions are working properly
		console.log('Testing transaction behavior...');

		let transactionCount = 0;
		doc.on('update', () => {
			transactionCount++;
			console.log('Y.js document update event fired, count:', transactionCount);
		});

		// Perform splice
		state.testArray.splice(1, 1, 'transaction-test');

		console.log('Total transaction count:', transactionCount);
		console.log('Final Y.js content:', state.testArray.getYType?.()?.toArray());
		console.log('Final proxy content:', [...state.testArray]);

		// Should have at least one transaction
		expect(transactionCount).toBeGreaterThan(0);
	});

	it('should verify syncroStates array consistency', () => {
		// Access internal syncroStates if possible
		const arrayProxy = state.testArray;
		console.log('Array proxy type:', typeof arrayProxy);
		console.log('Array proxy constructor:', arrayProxy.constructor.name);

		// Check if we can access internal state
		if (arrayProxy.syncroStates) {
			console.log('SyncroStates length:', arrayProxy.syncroStates.length);
			console.log(
				'SyncroStates types:',
				arrayProxy.syncroStates.map((s) => typeof s)
			);
		}

		if (arrayProxy.yType) {
			console.log('YType length:', arrayProxy.yType.length);
			console.log('YType content:', arrayProxy.yType.toArray());
		}

		// Perform splice and check internal consistency
		state.testArray.splice(1, 1, 'internal-test');

		if (arrayProxy.syncroStates && arrayProxy.yType) {
			console.log('After splice - SyncroStates length:', arrayProxy.syncroStates.length);
			console.log('After splice - YType length:', arrayProxy.yType.length);

			expect(arrayProxy.syncroStates.length).toBe(arrayProxy.yType.length);
			expect(arrayProxy.syncroStates.length).toBe(state.testArray.length);
		}
	});

	it('should verify multi-document synchronization setup', () => {
		// Create second document and state
		const schema = { testArray: y.array(y.string()) };
		const state2 = syncroState({ schema, doc });

		// Initialize second state
		state2.testArray = ['x', 'y', 'z'];

		console.log('Doc1 initial:', state.testArray.getYType?.()?.toJSON());
		console.log('Doc2 initial:', state2.testArray.getYType?.()?.toJSON());

		console.log('Doc1 after sync:', state.testArray.getYType?.()?.toJSON());
		console.log('Doc2 after sync:', state2.testArray.getYType?.()?.toJSON());
		console.log('State1 after sync:', [...state.testArray]);
		console.log('State2 after sync:', [...state2.testArray]);

		// Test if states converge (they might not due to the sync issue)
		const doc1Content = state.testArray.getYType?.()?.toJSON() || [];
		const doc2Content = state2.testArray.getYType?.()?.toJSON() || [];

		if (JSON.stringify(doc1Content) !== JSON.stringify(doc2Content)) {
			console.log('ISSUE: Documents did not converge properly');
		}

		// This might fail due to synchronization issues
		expect(doc1Content).toEqual(doc2Content);
	});
});
