import { describe, it, expect, beforeEach } from 'vitest';
import { syncroState, y } from '../lib/index.js';
import { Doc } from 'yjs';

const doc = new Doc();
const state = syncroState({
	defaultValue: {
		hello: 'world'
	} as {
		hello: string | number | boolean | Date;
	},
	doc
});

const copyState = syncroState({
	defaultValue: {
		hello: 'world'
	} as {
		hello: string | number | boolean | Date;
	},
	doc
});

describe('SyncroState', () => {
	it('should be initialized with the default value', () => {
		expect(state.hello).toBe('world');
		console.log(copyState.hello);
		expect(copyState.hello).toBe('world');
	});

	it('should set the value', () => {
		state.hello = 'world2';
		expect(state.hello).toBe('world2');
	});

	it('should change the type and the value to a number', () => {
		state.hello = 1;
		expect(state.hello).toBe(1);
	});

	it('should change the type and the value to a string', () => {
		state.hello = 'world';
		expect(state.hello).toBe('world');
	});

	it('should change the type and the value to a boolean', () => {
		state.hello = true;
		expect(state.hello).toBe(true);
	});

	it('should change the type and the value to a date', () => {
		const date = new Date();
		state.hello = date;
		expect(state.hello.getTime()).toBe(date.getTime());
		console.log('state.hello', state.hello.getTime(), date.getTime());
	});
});
