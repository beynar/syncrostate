import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { syncroState, y } from '../../lib/index.js';
import { SvelteSet } from 'svelte/reactivity';

let createDocument = () =>
	syncroState({
		schema: {
			set: y.set(y.string()),
			nullableSet: y.set(y.string()).nullable(),
			optionalSet: y.set(y.string()).optional(),
			nullableOptionalSet: y.set(y.string()).nullable().optional(),
			setWithDefault: y.set(y.string()).default(new SvelteSet(['default'])),
			setWithDefaultAndOptional: y
				.set(y.string())
				.default(new Set(['default']))
				.optional(),
			setWithDefaultAndNullable: y
				.set(y.string())
				.default(new Set(['default']))
				.nullable(),
			setWithDefaultAndNullableAndOptional: y
				.set(y.string())
				.default(new Set(['default']))
				.nullable()
				.optional()
		}
	});

let state = createDocument();

describe('SetProxy', () => {
	describe('Initial values', () => {
		it('should be a Set', () => {
			expect(state.set instanceof Set).toBe(true);
			expect(state.set.size).toBe(0);
		});

		it('should have null as default value for nullable set', () => {
			expect(state.nullableSet).toBe(null);
		});

		it('should have undefined as default value for optional set', () => {
			expect(state.optionalSet).toBe(undefined);
		});

		it('should have undefined as default value for nullable optional set', () => {
			expect(state.nullableOptionalSet).toBe(undefined);
		});

		it('should have default value for set with default', () => {
			console.log('state.setWithDefault', Array.from(state.setWithDefault));
			expect(Array.from(state.setWithDefault)).toEqual(['default']);
		});

		it('should have default value for optional set with default', () => {
			expect(Array.from(state.setWithDefaultAndOptional)).toEqual(['default']);
		});

		it('should have default value for nullable set with default', () => {
			expect(Array.from(state.setWithDefaultAndNullable)).toEqual(['default']);
		});

		it('should have default value for nullable optional set with default', () => {
			expect(Array.from(state.setWithDefaultAndNullableAndOptional)).toEqual(['default']);
		});
	});

	// const expectEqual = (a: Set<any>, b: any) => {
	// 	expect([...Array.from(a)]).toStrictEqual(b);
	// };
	describe('Setters', () => {
		// describe('Set', () => {
		// 	beforeEach(() => {
		// 		state.set = new Set(['test']);
		// 	});

		// 	it('should set the value', () => {
		// 		state.set = new Set(['hello', 'world']);
		// 		expect(Array.from(state.set)).toEqual(['hello', 'world']);
		// 	});

		// 	it('should not set the value to null', () => {
		// 		(state.set as any) = null;
		// 		expect(Array.from(state.set)).toEqual(['test']);
		// 	});

		// 	it('should not set the value to undefined', () => {
		// 		(state.set as any) = undefined;
		// 		expect(Array.from(state.set)).toEqual(['test']);
		// 	});

		// 	it('should not set the value to a string', () => {
		// 		(state.set as any) = 'invalid';
		// 		expect(Array.from(state.set)).toEqual(['test']);
		// 	});

		// 	it('should not set the value to a number', () => {
		// 		(state.set as any) = 123;
		// 		expect(Array.from(state.set)).toEqual(['test']);
		// 	});

		// 	it('should not set invalid set items', () => {
		// 		(state.set as any) = new Set([123, true, {}]);
		// 		expect(Array.from(state.set)).toEqual(['test']);
		// 	});

		// 	it('should support set methods', () => {
		// 		state.set.add('world');
		// 		console.log(state.set);
		// 		expect(Array.from(state.set)).toEqual(['test', 'world']);

		// 		state.set.delete('world');
		// 		expect(Array.from(state.set)).toEqual(['test']);

		// 		state.set.add('hello');
		// 		expect(Array.from(state.set)).toEqual(['test', 'hello']);

		// 		expect(state.set.has('test')).toBe(true);
		// 		expect(state.set.has('world')).toBe(false);
		// 		state.set.clear();
		// 		expect(Array.from(state.set)).toEqual([]);
		// 	});
		// });

		// describe('Nullable Set', () => {
		// 	beforeEach(() => {
		// 		state.nullableSet = new Set(['test']);
		// 	});

		// 	it('should set the value', () => {
		// 		state.nullableSet = new Set(['hello', 'world']);
		// 		expect(Array.from(state.nullableSet)).toEqual(['hello', 'world']);
		// 	});

		// 	it('should set the value to null', () => {
		// 		state.nullableSet = null;
		// 		expect(state.nullableSet).toBe(null);
		// 	});

		// 	it('should not set the value to undefined', () => {
		// 		(state.nullableSet as any) = undefined;
		// 		expect(Array.from(state.nullableSet)).toEqual(['test']);
		// 	});

		// 	it('should not set the value to a string', () => {
		// 		(state.nullableSet as any) = 'invalid';
		// 		expect(Array.from(state.nullableSet)).toEqual(['test']);
		// 	});

		// 	it('should not set the value to a number', () => {
		// 		(state.nullableSet as any) = 123;
		// 		expect(Array.from(state.nullableSet)).toEqual(['test']);
		// 	});

		// 	it('should not set invalid set items', () => {
		// 		(state.nullableSet as any) = new Set([123, true, {}]);
		// 		expect(Array.from(state.nullableSet)).toEqual(['test']);
		// 	});
		// });

		describe('Optional Set', () => {
			beforeAll(() => {
				state.optionalSet = new Set(['test']);
			});

			beforeEach(() => {
				state.optionalSet = new Set(['test']);
			});

			it('should set the value', () => {
				state.optionalSet = new Set(['hello', 'world']);
				expect(Array.from(state.optionalSet)).toEqual(['hello', 'world']);
			});

			// it('should set the value to undefined', () => {
			// 	state.optionalSet = undefined;
			// 	expect(state.optionalSet).toBe(undefined);
			// });

			it('should not set the value to null', () => {
				(state.optionalSet as any) = null;
				console.log('state.optionalSet', state.optionalSet);
				expect(Array.from(state.optionalSet)).toEqual(['test']);
			});

			it('should not set the value to a string', () => {
				(state.optionalSet as any) = 'invalid';
				expect(Array.from(state.optionalSet)).toEqual(['test']);
			});

			it('should not set the value to a number', () => {
				(state.optionalSet as any) = 123;
				expect(Array.from(state.optionalSet)).toEqual(['test']);
			});

			it('should not set invalid set items', () => {
				(state.optionalSet as any) = new Set([123, true, {}]);
				expect(Array.from(state.optionalSet)).toEqual(['test']);
			});
		});

		describe('Nullable Optional Set', () => {
			beforeAll(() => {
				state.nullableOptionalSet = new Set(['test']);
			});

			beforeEach(() => {
				state.nullableOptionalSet = new Set(['test']);
			});

			it('should set the value', () => {
				state.nullableOptionalSet = new Set(['hello', 'world']);
				expect(Array.from(state.nullableOptionalSet)).toEqual(['hello', 'world']);
			});

			it('should set the value to null', () => {
				state.nullableOptionalSet = null;
				expect(state.nullableOptionalSet).toBe(null);
			});

			// it('should set the value to undefined', () => {
			// 	state.nullableOptionalSet = undefined;
			// 	expect(state.nullableOptionalSet).toBe(undefined);
			// });

			it('should not set the value to a string', () => {
				(state.nullableOptionalSet as any) = 'invalid';
				expect(Array.from(state.nullableOptionalSet)).toEqual(['test']);
			});

			it('should not set the value to a number', () => {
				(state.nullableOptionalSet as any) = 123;
				expect(Array.from(state.nullableOptionalSet)).toEqual(['test']);
			});

			it('should not set invalid set items', () => {
				(state.nullableOptionalSet as any) = new Set([123, true, {}]);
				expect(Array.from(state.nullableOptionalSet)).toEqual(['test']);
			});
		});
	});
});
