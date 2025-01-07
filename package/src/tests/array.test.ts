import { describe, it, expect } from 'vitest';
import { syncroState } from '../lib/proxys/syncroState.svelte.js';
import { y } from '../lib/schemas/schema.js';
import * as Y from 'yjs';

describe('init function', () => {
	it('should initialize a simple object schema correctly', () => {
		const synced = syncroState({
			schema: {
				name: y.string().default('John'),
				friends: y.array(y.object({ name: y.string() })).default([])
			}
		});

		// const doc = new Y.Doc();
		// const yArray = doc.getArray('friends');

		// yArray.push([new Y.Text('hello')]);

		// console.log('yArray', yArray.toJSON());

		const mirrorArray = ['John'];

		const arrayProxy = new Proxy([], {
			get: (target, p) => {
				if (Number.isInteger(Number(p))) {
					return mirrorArray[Number(p)];
				} else {
					console.log('get', p);
					return Reflect.get(target, p);
				}
			},
			apply(target, thisArg, argumentsList) {
				console.log('apply', argumentsList);
				return target[argumentsList[0]];
			}
		});
		const methods = {
			push() {
				console.log('push');
				return arrayProxy;
			}
		};

		console.log('arrayProxy.at(0)', arrayProxy.at(1));

		Object.entries(methods).forEach(([method, fn]) => {
			Object.assign(arrayProxy, { [method]: fn });
		});

		console.log('synced.name', synced.name);
		console.log('synced.friends', synced.friends);
		console.log('arrayProxy', arrayProxy[0]);
		arrayProxy.push('je');
		expect(synced.name).toBe('John');
	});
});
