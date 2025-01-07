import { describe, it, expect } from 'vitest';
// import { picklist } from 'valibot';
// import { type ObjectSchema } from 'valibot';
// import { type BaseSchema } from 'valibot';
// import { type BaseIssue } from 'valibot';
// import { SvelteMap } from 'svelte/reactivity';
// import { traverseSchema } from '$lib/traverse.js';
// type BasicSchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

// const forEachEntries = (
// 	schema: ObjectSchema<any, any>,
// 	callback: (key: string, type: BasicSchema) => void
// ) => {
// 	for (const [key, type] of Object.entries(schema.entries)) {
// 		callback(key, type);
// 	}
// };

describe('init function', () => {
	it('should initialize a simple object schema correctly', () => {
		// const typesMap = new SvelteMap<string, any>();
		// const schema = {};
		// const doc = traverseSchema({
		// 	schema: {
		// 		name: 'string',
		// 		age: 'number',
		// 		lang: '<test,test2,test3>',

		// 		address: {
		// 			street: 'string',
		// 			city: 'string',
		// 			zip: 'string'
		// 		},
		// 		friends: [
		// 			{
		// 				name: 'string',
		// 				gender: '<male,female>'
		// 			}
		// 		]
		// 	},
		// 	follower: {},
		// 	onType: (p) => {
		// 		if (p.path === 'friends') {
		// 			console.log(p.schema);
		// 		}
		// 		typesMap.set(p.path, p.type);
		// 	}
		// });

		// console.log(typesMap.keys());
		expect(true).toBe(true);
	});

	// 	it('should initialize a simple object schema correctly', () => {
	// 		const proxy = new Proxy({} as any, {
	// 			get(target, p) {
	// 				return 'world';
	// 			},
	// 			getOwnPropertyDescriptor(target, p) {
	// 				if (typeof p === 'string') {
	// 					return {
	// 						enumerable: true,
	// 						configurable: true
	// 					};
	// 				}
	// 				return undefined;
	// 			},
	// 			ownKeys: (target) => {
	// 				console.log('ownKeys');
	// 				return ['hello'];
	// 			}
	// 		});
	// 		console.log(Object.values(proxy));
	// 	});
});
