import { describe, it, expect, beforeEach } from 'vitest';
import { syncroState, y } from '../../lib/index.js';

type StringMap = Map<string, string>;
type ObjectMap = Map<string, { name: string; age: number }>;

const state = syncroState({
	schema: {
		map: y.map(y.string()),
		nullableMap: y.map(y.string()).nullable(),
		optionalMap: y.map(y.string()).optional(),
		nullableOptionalMap: y.map(y.string()).nullable().optional(),
		mapWithDefault: y.map(y.string()).default(new Map([['key', 'default']])),
		mapWithDefaultAndOptional: y
			.map(y.string())
			.default(new Map([['key', 'default']]))
			.optional(),
		mapWithDefaultAndNullable: y
			.map(y.string())
			.default(new Map([['key', 'default']]))
			.nullable(),
		mapWithDefaultAndNullableAndOptional: y
			.map(y.string())
			.default(new Map([['key', 'default']]))
			.nullable()
			.optional(),
		mapWithObject: y.map(
			y.object({
				name: y.string(),
				age: y.number()
			})
		)
	}
});

describe('MapProxy', () => {
	describe('Initial values', () => {
		it('should be a Map', () => {
			expect(state.map instanceof Map).toBe(true);
			expect(state.map.size).toBe(0);
		});

		it('should have null as default value for nullable map', () => {
			expect(state.nullableMap).toBe(null);
		});

		it('should have undefined as default value for optional map', () => {
			expect(state.optionalMap).toBe(undefined);
		});

		it('should have undefined as default value for nullable optional map', () => {
			expect(state.nullableOptionalMap).toBe(undefined);
		});

		it('should have default value for map with default', () => {
			expect(state.mapWithDefault instanceof Map).toBe(true);
			expect(state.mapWithDefault.get('key')).toBe('default');
		});

		it('should have default value for optional map with default', () => {
			expect(state.mapWithDefaultAndOptional instanceof Map).toBe(true);
			expect(state.mapWithDefaultAndOptional.get('key')).toBe('default');
		});

		it('should have default value for nullable map with default', () => {
			expect(state.mapWithDefaultAndNullable instanceof Map).toBe(true);
			expect(state.mapWithDefaultAndNullable.get('key')).toBe('default');
		});

		it('should have default value for nullable optional map with default', () => {
			expect(state.mapWithDefaultAndNullableAndOptional instanceof Map).toBe(true);
			expect(state.mapWithDefaultAndNullableAndOptional.get('key')).toBe('default');
		});
	});

	describe('Setters', () => {
		describe('Map', () => {
			beforeEach(() => {
				state.map = new Map([['test', 'value']]) as StringMap;
			});

			it('should set the value', () => {
				state.map = new Map([
					['hello', 'world'],
					['foo', 'bar']
				]) as StringMap;
				expect(Array.from(state.map.entries())).toEqual([
					['hello', 'world'],
					['foo', 'bar']
				]);
			});

			it('should not set invalid values', () => {
				const initialValue = Array.from(state.map.entries());

				// Test invalid primitive values
				const invalidValues = [null, undefined, 'invalid', 123, true, {}];
				for (const value of invalidValues) {
					try {
						(state.map as any) = value;
					} catch {}
					expect(Array.from(state.map.entries())).toEqual(initialValue);
				}

				// Test invalid map values
				const invalidMapValue = new Map<string, string | number | boolean>();
				invalidMapValue.set('key1', 123);
				invalidMapValue.set('key2', true);

				try {
					(state.map as any) = invalidMapValue;
				} catch {}
				expect(Array.from(state.map.entries())).toEqual(initialValue);
			});

			it('should support map methods', () => {
				state.map.set('key', 'value');
				expect(state.map.get('key')).toBe('value');

				state.map.delete('key');
				expect(state.map.has('key')).toBe(false);

				state.map.clear();
				expect(state.map.size).toBe(0);
			});
		});

		describe('Nullable Map', () => {
			beforeEach(() => {
				state.nullableMap = new Map([['test', 'value']]) as StringMap;
			});

			it('should set the value', () => {
				state.nullableMap = new Map([
					['hello', 'world'],
					['foo', 'bar']
				]) as StringMap;
				expect(Array.from(state.nullableMap!.entries())).toEqual([
					['hello', 'world'],
					['foo', 'bar']
				]);
			});

			it('should set the value to null', () => {
				(state.nullableMap as any) = null;
				expect(state.nullableMap).toBe(null);
			});

			it('should not set invalid values', () => {
				const initialValue = Array.from(state.nullableMap!.entries());

				// Test invalid primitive values
				const invalidValues = [undefined, 'invalid', 123, true, {}];
				for (const value of invalidValues) {
					try {
						(state.nullableMap as any) = value;
					} catch {}
					expect(Array.from(state.nullableMap!.entries())).toEqual(initialValue);
				}

				// Test invalid map values
				const invalidMapValue = new Map<string, string | number | boolean>();
				invalidMapValue.set('key1', 123);
				invalidMapValue.set('key2', true);

				try {
					(state.nullableMap as any) = invalidMapValue;
				} catch {}
				expect(Array.from(state.nullableMap!.entries())).toEqual(initialValue);
			});
		});

		describe('Optional Map', () => {
			beforeEach(() => {
				state.optionalMap = new Map([['test', 'value']]) as StringMap;
			});

			it('should set the value', () => {
				state.optionalMap = new Map([
					['hello', 'world'],
					['foo', 'bar']
				]) as StringMap;
				expect(Array.from(state.optionalMap!.entries())).toEqual([
					['hello', 'world'],
					['foo', 'bar']
				]);
			});

			it('should set the value to undefined', () => {
				(state.optionalMap as any) = undefined;
				expect(state.optionalMap).toBe(undefined);
			});

			it('should not set invalid values', () => {
				const initialValue = Array.from(state.optionalMap!.entries());

				// Test invalid primitive values
				const invalidValues = [null, 'invalid', 123, true, {}];
				for (const value of invalidValues) {
					try {
						(state.optionalMap as any) = value;
					} catch {}
					expect(Array.from(state.optionalMap!.entries())).toEqual(initialValue);
				}

				// Test invalid map values
				const invalidMapValue = new Map<string, string | number | boolean>();
				invalidMapValue.set('key1', 123);
				invalidMapValue.set('key2', true);

				try {
					(state.optionalMap as any) = invalidMapValue;
				} catch {}
				expect(Array.from(state.optionalMap!.entries())).toEqual(initialValue);
			});
		});

		describe('Nullable Optional Map', () => {
			beforeEach(() => {
				state.nullableOptionalMap = new Map([['test', 'value']]) as StringMap;
			});

			it('should set the value', () => {
				state.nullableOptionalMap = new Map([
					['hello', 'world'],
					['foo', 'bar']
				]) as StringMap;
				expect(Array.from(state.nullableOptionalMap!.entries())).toEqual([
					['hello', 'world'],
					['foo', 'bar']
				]);
			});

			it('should set the value to null', () => {
				(state.nullableOptionalMap as any) = null;
				expect(state.nullableOptionalMap).toBe(null);
			});

			it('should set the value to undefined', () => {
				(state.nullableOptionalMap as any) = undefined;
				expect(state.nullableOptionalMap).toBe(undefined);
			});

			it('should not set invalid values', () => {
				const initialValue = Array.from(state.nullableOptionalMap!.entries());

				// Test invalid primitive values
				const invalidValues = ['invalid', 123, true, {}];
				for (const value of invalidValues) {
					try {
						(state.nullableOptionalMap as any) = value;
					} catch {}
					expect(Array.from(state.nullableOptionalMap!.entries())).toEqual(initialValue);
				}

				// Test invalid map values
				const invalidMapValue = new Map<string, string | number | boolean>();
				invalidMapValue.set('key1', 123);
				invalidMapValue.set('key2', true);

				try {
					(state.nullableOptionalMap as any) = invalidMapValue;
				} catch {}
				expect(Array.from(state.nullableOptionalMap!.entries())).toEqual(initialValue);
			});
		});

		describe('Map With Object Values', () => {
			beforeEach(() => {
				state.mapWithObject = new Map([['test', { name: 'John', age: 30 }]]) as ObjectMap;
			});

			it('should set valid object values', () => {
				state.mapWithObject = new Map([
					['user1', { name: 'John', age: 30 }],
					['user2', { name: 'Jane', age: 25 }]
				]) as ObjectMap;
				expect(Array.from(state.mapWithObject.entries())).toEqual([
					['user1', { name: 'John', age: 30 }],
					['user2', { name: 'Jane', age: 25 }]
				]);
			});

			it('should not set invalid object values', () => {
				const initialValue = Array.from(state.mapWithObject.entries());

				// Test invalid map values
				const invalidMapValue = new Map<string, { name: any; age: any }>();
				invalidMapValue.set('user1', { name: 123, age: 'invalid' });
				invalidMapValue.set('user2', { name: 'Jane', age: true });

				try {
					(state.mapWithObject as any) = invalidMapValue;
				} catch {}
				expect(Array.from(state.mapWithObject.entries())).toEqual(initialValue);
			});

			it('should support partial updates through map methods', () => {
				state.mapWithObject.set('user1', { name: 'John Doe', age: 31 });
				expect(state.mapWithObject.get('user1')).toEqual({ name: 'John Doe', age: 31 });

				state.mapWithObject.delete('user1');
				expect(state.mapWithObject.has('user1')).toBe(false);
			});
		});
	});
});
