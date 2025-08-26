import { describe, it, expect } from 'vitest';
import { syncroState, y } from '../../lib/index.js';
import * as Y from 'yjs';

describe('DiscriminatedUnion Integration Tests', () => {
	it('should work with the full syncroState system', () => {
		const apiResponseSchema = y.discriminatedUnion('status', [
			y.object({ status: y.literal('success'), data: y.string() }),
			y.object({ status: y.literal('error'), message: y.string() })
		]);

		const schema = {
			response: apiResponseSchema
		};

		const doc = new Y.Doc();
		const state1 = syncroState({ schema, doc });
		const state2 = syncroState({ schema, doc });

		// Test initial state
		expect(state1.response).toBeDefined();
		expect(state2.response).toBeDefined();

		// Test setting success variant
		state1.response = { status: 'success', data: 'Hello world' };

		expect(state1.response.status).toBe('success');
		expect(state1.response.data).toBe('Hello world');
		expect(state2.response.status).toBe('success');
		if (state2.response.status === 'success') {
			expect(state2.response.data).toBe('Hello world');
		}

		// Test switching to error variant
		state1.response = { status: 'error', message: 'Something went wrong' };

		expect(state1.response.status).toBe('error');
		expect(state1.response.message).toBe('Something went wrong');
		expect(state2.response.status).toBe('error');
		if (state2.response.status === 'error') {
			expect(state2.response.message).toBe('Something went wrong');
		}

		// Test property access
		expect('status' in state1.response).toBe(true);
		expect('message' in state1.response).toBe(true);
		expect('data' in state1.response).toBe(false);

		// Test Object.keys
		const keys = Object.keys(state1.response);
		expect(keys).toContain('status');
		expect(keys).toContain('message');
		expect(keys).not.toContain('data');

		// Test JSON serialization
		const json = JSON.stringify(state1.response);
		const parsed = JSON.parse(json);
		expect(parsed.status).toBe('error');
		expect(parsed.message).toBe('Something went wrong');
	});

	it('should handle nullable discriminated unions', () => {
		const schema = {
			result: y
				.discriminatedUnion('type', [
					y.object({ type: y.literal('data'), value: y.string() }),
					y.object({ type: y.literal('error'), code: y.number() })
				])
				.nullable()
		};

		const doc = new Y.Doc();
		const state = syncroState({ schema, doc });

		// Test null assignment
		state.result = null;
		expect(state.result).toBeNull();

		// Test setting value after null
		state.result = { type: 'data', value: 'test' };
		expect(state.result.type).toBe('data');
		expect(state.result.value).toBe('test');
	});

	it('should handle complex nested discriminated unions', () => {
		const userSchema = y.discriminatedUnion('role', [
			y.object({ role: y.literal('admin'), name: y.string(), permissions: y.array(y.string()) }),
			y.object({ role: y.literal('user'), name: y.string(), email: y.string() }),
			y.object({ role: y.literal('guest'), sessionId: y.string() })
		]);

		const schema = { user: userSchema };
		const doc = new Y.Doc();
		const state1 = syncroState({ schema, doc });
		const state2 = syncroState({ schema, doc });

		// Test admin user
		state1.user = {
			role: 'admin',
			name: 'John Admin',
			permissions: ['read', 'write', 'delete']
		};

		expect(state2.user.role).toBe('admin');
		if (state2.user.role === 'admin') {
			expect(state2.user.name).toBe('John Admin');
			expect(state2.user.permissions).toEqual(['read', 'write', 'delete']);
		}

		// Test switching to regular user
		state1.user = {
			role: 'user',
			name: 'Jane User',
			email: 'jane@example.com'
		};

		expect(state2.user.role).toBe('user');
		if (state2.user.role === 'user') {
			expect(state2.user.name).toBe('Jane User');
			expect(state2.user.email).toBe('jane@example.com');
		}
		expect('permissions' in state2.user).toBe(false);

		// Test switching to guest
		state1.user = {
			role: 'guest',
			sessionId: 'guest-123'
		};

		expect(state2.user.role).toBe('guest');
		if (state2.user.role === 'guest') {
			expect(state2.user.sessionId).toBe('guest-123');
		}
		expect('name' in state2.user).toBe(false);
		expect('email' in state2.user).toBe(false);
	});
});
