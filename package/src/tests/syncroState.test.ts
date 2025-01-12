import { describe, it, expect, beforeEach } from 'vitest';
import { syncroState, y } from '../lib/index.js';
import { Doc } from 'yjs';

const schema = {
	text: y.string().optional().nullable().default('default'),
	number: y.number().optional().nullable().default(1),
	boolean: y.boolean().optional().nullable().default(false),
	array: y.array(y.string()).optional().nullable().default(['default']),
	date: y.date().optional().nullable().default(new Date()),
	enum: y.enum('a', 'b', 'c').optional().nullable().default('a'),
	object: y
		.object({
			text: y.string().optional().nullable().default('default'),
			number: y.number().optional().nullable().default(1),
			boolean: y.boolean().optional().nullable().default(false)
		})
		.optional()
		.nullable()
		.default({ text: 'default', number: 1, boolean: false }),
	set: y.set(y.string()).optional().nullable().default(['default'])
};

const doc = new Doc();
const state1 = syncroState({ schema, doc });
const state2 = syncroState({ schema, doc });

describe('SyncroState', () => {
	describe('text field', () => {
		it('should sync regular text mutation', () => {
			state1.text = 'world';
			expect(state1.text).toBe('world');
			expect(state2.text).toBe('world');
		});

		it('should sync null text mutation', () => {
			state1.text = null;
			expect(state1.text).toBe(null);
			expect(state2.text).toBe(null);
		});

		it('should sync undefined text mutation', () => {
			state1.text = undefined;
			expect(state1.text).toBe(undefined);
			expect(state2.text).toBe(undefined);
		});
	});

	describe('number field', () => {
		it('should sync regular number mutation', () => {
			state1.number = 42;
			expect(state1.number).toBe(42);
			expect(state2.number).toBe(42);
		});

		it('should sync null number mutation', () => {
			state1.number = null;
			expect(state1.number).toBe(null);
			expect(state2.number).toBe(null);
		});

		it('should sync undefined number mutation', () => {
			state1.number = undefined;
			expect(state1.number).toBe(undefined);
			expect(state2.number).toBe(undefined);
		});
	});

	describe('boolean field', () => {
		it('should sync regular boolean mutation', () => {
			state1.boolean = true;
			expect(state1.boolean).toBe(true);
			expect(state2.boolean).toBe(true);
		});

		it('should sync null boolean mutation', () => {
			state1.boolean = null;
			expect(state1.boolean).toBe(null);
			expect(state2.boolean).toBe(null);
		});

		it('should sync undefined boolean mutation', () => {
			state1.boolean = undefined;
			expect(state1.boolean).toBe(undefined);
			expect(state2.boolean).toBe(undefined);
		});
	});

	describe('date field', () => {
		it('should sync regular date mutation', () => {
			const newDate = new Date('2024-01-01');
			state1.date = newDate;
			expect(state1.date?.toISOString()).toEqual(newDate.toISOString());
			expect(state2.date?.toISOString()).toEqual(newDate.toISOString());
		});

		it('should sync null date mutation', () => {
			state1.date = null;
			expect(state1.date).toBe(null);
			expect(state2.date).toBe(null);
		});

		it('should sync undefined date mutation', () => {
			state1.date = undefined;
			expect(state1.date).toBe(undefined);
			expect(state2.date).toBe(undefined);
		});
	});

	describe('enum field', () => {
		it('should sync regular enum mutation', () => {
			state1.enum = 'b';
			expect(state1.enum).toBe('b');
			expect(state2.enum).toBe('b');
		});

		it('should sync null enum mutation', () => {
			state1.enum = null;
			expect(state1.enum).toBe(null);
			expect(state2.enum).toBe(null);
		});

		it('should sync undefined enum mutation', () => {
			state1.enum = undefined;
			expect(state1.enum).toBe(undefined);
			expect(state2.enum).toBe(undefined);
		});
	});

	describe('object field', () => {
		it('should sync regular object mutation', () => {
			state1.object = { text: 'hello', number: 42, boolean: true };
			expect(state1.object).toEqual({ text: 'hello', number: 42, boolean: true });
			expect(state2.object).toEqual({ text: 'hello', number: 42, boolean: true });
		});

		it('should sync null object mutation', () => {
			(state1.object as any) = null;
			expect(state1.object).toBe(null);
			expect(state2.object).toBe(null);
		});

		it('should sync undefined object mutation', () => {
			(state1.object as any) = undefined;
			expect(state1.object).toBe(undefined);
			expect(state2.object).toBe(undefined);
		});
	});

	describe('array field', () => {
		it('should sync regular array mutation', () => {
			state1.array = ['hello', 'world'];
			expect(state1.array).toEqual(['hello', 'world']);
			expect(state2.array).toEqual(['hello', 'world']);
		});

		it('should sync null array mutation', () => {
			(state1.array as any) = null;
			expect(state1.array).toBe(null);
			expect(state2.array).toBe(null);
		});

		it('should sync undefined array mutation', () => {
			(state1.array as any) = undefined;
			expect(state1.array).toBe(undefined);
			expect(state2.array).toBe(undefined);
		});
	});

	describe('set field', () => {
		it('should sync regular set mutation', () => {
			state1.set = new Set(['hello', 'world']);
			expect(Array.from(state1.set)).toEqual(['hello', 'world']);
			expect(Array.from(state2.set)).toEqual(['hello', 'world']);
		});

		it('should sync null set mutation', () => {
			(state1.set as any) = null;
			expect(state1.set).toBe(null);
			expect(state2.set).toBe(null);
		});

		it('should sync undefined set mutation', () => {
			(state1.set as any) = undefined;
			expect(state1.set).toBe(undefined);
			expect(state2.set).toBe(undefined);
		});
	});
});
