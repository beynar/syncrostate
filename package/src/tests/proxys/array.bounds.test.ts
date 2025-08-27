import { describe, it, expect, beforeEach } from 'vitest';
import { syncroState, y } from '../../lib/index.js';
import * as Y from 'yjs';

describe('Array Bounds Validation Tests', () => {
	const doc = new Y.Doc();
	const schema = {
		testArray: y.array(y.string())
	};

	const state = syncroState({ schema, doc });

	beforeEach(() => {
		state.testArray = ['a', 'b', 'c', 'd', 'e'];
	});

	describe('Negative start index handling', () => {
		it('should handle negative start index like native Array.splice', () => {
			// Test -1 (last element)
			state.testArray.splice(-1, 1, 'z');
			expect([...state.testArray]).toEqual(['a', 'b', 'c', 'd', 'z']);
			
			// Reset
			state.testArray = ['a', 'b', 'c', 'd', 'e'];
			
			// Test -2 (second to last)
			state.testArray.splice(-2, 1, 'y');
			expect([...state.testArray]).toEqual(['a', 'b', 'c', 'y', 'e']);
			
			// Reset
			state.testArray = ['a', 'b', 'c', 'd', 'e'];
			
			// Test negative index beyond array length (should start at 0)
			state.testArray.splice(-10, 1, 'start');
			expect([...state.testArray]).toEqual(['start', 'b', 'c', 'd', 'e']);
		});

		it('should handle negative start with Y.js document consistency', () => {
			state.testArray.splice(-1, 1, 'last');
			
			const yArray = state.testArray.getYType?.();
			expect(yArray!.length).toBe(5);
			expect(yArray!.toJSON()).toEqual(['a', 'b', 'c', 'd', 'last']);
		});
	});

	describe('Start index beyond array length', () => {
		it('should handle start index beyond array length', () => {
			// Insert at end when start > length
			state.testArray.splice(10, 0, 'end1', 'end2');
			expect([...state.testArray]).toEqual(['a', 'b', 'c', 'd', 'e', 'end1', 'end2']);
		});

		it('should handle start index beyond array length with Y.js consistency', () => {
			state.testArray.splice(100, 0, 'far');
			
			const yArray = state.testArray.getYType?.();
			expect(yArray!.length).toBe(6);
			expect(yArray!.toJSON()).toEqual(['a', 'b', 'c', 'd', 'e', 'far']);
		});
	});

	describe('DeleteCount validation', () => {
		it('should handle deleteCount larger than remaining elements', () => {
			// Try to delete 100 items starting at index 2 (only 3 items remain)
			const result = state.testArray.splice(2, 100, 'x');
			
			expect([...state.testArray]).toEqual(['a', 'b', 'x']);
			expect(result.length).toBe(3); // Should return the 3 deleted items
		});

		it('should handle deleteCount larger than remaining with Y.js consistency', () => {
			state.testArray.splice(1, 1000);
			
			const yArray = state.testArray.getYType?.();
			expect(yArray!.length).toBe(1);
			expect(yArray!.toJSON()).toEqual(['a']);
		});

		it('should handle negative deleteCount (should be treated as 0)', () => {
			const originalLength = state.testArray.length;
			state.testArray.splice(2, -5, 'inserted');
			
			// Should only insert, not delete anything
			expect(state.testArray.length).toBe(originalLength + 1);
			expect([...state.testArray]).toEqual(['a', 'b', 'inserted', 'c', 'd', 'e']);
		});
	});

	describe('Edge cases', () => {
		it('should handle empty array splice operations', () => {
			state.testArray = [];
			
			// Insert into empty array
			state.testArray.splice(0, 0, 'first');
			expect([...state.testArray]).toEqual(['first']);
			
			// Insert beyond bounds in empty array
			state.testArray.splice(10, 0, 'second');
			expect([...state.testArray]).toEqual(['first', 'second']);
		});

		it('should handle zero deleteCount with insertions', () => {
			state.testArray.splice(2, 0, 'x', 'y');
			expect([...state.testArray]).toEqual(['a', 'b', 'x', 'y', 'c', 'd', 'e']);
			expect(state.testArray.length).toBe(7);
		});

		it('should handle splice with no insertions (deletion only)', () => {
			state.testArray.splice(1, 3);
			expect([...state.testArray]).toEqual(['a', 'e']);
			expect(state.testArray.length).toBe(2);
		});

		it('should handle single element array operations', () => {
			state.testArray = ['only'];
			
			// Replace single element
			state.testArray.splice(0, 1, 'replaced');
			expect([...state.testArray]).toEqual(['replaced']);
			
			// Delete single element
			state.testArray.splice(0, 1);
			expect([...state.testArray]).toEqual([]);
			expect(state.testArray.length).toBe(0);
		});
	});

	describe('Boundary stress tests', () => {
		it('should handle multiple boundary violations in sequence', () => {
			// Start with fresh array
			state.testArray = ['a', 'b', 'c'];
			
			// Negative start, excessive deleteCount
			state.testArray.splice(-10, 100, 'x');
			expect([...state.testArray]).toEqual(['x']);
			
			// Beyond bounds start
			state.testArray.splice(100, 0, 'y');
			expect([...state.testArray]).toEqual(['x', 'y']);
			
			// Verify Y.js consistency
			const yArray = state.testArray.getYType?.();
			expect(yArray!.toJSON()).toEqual(['x', 'y']);
		});

		it('should not throw "Length exceeded!" errors with invalid bounds', () => {
			// These operations should not crash
			expect(() => {
				state.testArray.splice(-1000, 1000, 'safe');
			}).not.toThrow();
			
			expect(() => {
				state.testArray.splice(1000, 1000, 'also-safe');
			}).not.toThrow();
			
			expect(() => {
				state.testArray.splice(0, -100);
			}).not.toThrow();
		});
	});

	describe('Return value validation', () => {
		it('should return correct deleted elements', () => {
			const deleted = state.testArray.splice(1, 2, 'x');
			
			// Should return the deleted SyncroState objects
			expect(deleted.length).toBe(2);
			// The actual values depend on the SyncroState implementation
		});

		it('should return empty array when no elements deleted', () => {
			const deleted = state.testArray.splice(2, 0, 'inserted');
			expect(deleted.length).toBe(0);
		});
	});
});
