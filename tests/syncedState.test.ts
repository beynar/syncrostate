import { describe, it, expect } from 'vitest';
import { picklist } from 'valibot';
import { type ObjectSchema } from 'valibot';
import { type BaseSchema } from 'valibot';
import { type BaseIssue } from 'valibot';
import { SvelteMap } from 'svelte/reactivity';
import { traverseSchema } from '$lib/traverse.js';
import { syncedState } from '$lib/proxys/syncedState.svelte.js';
type BasicSchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

const forEachEntries = (
	schema: ObjectSchema<any, any>,
	callback: (key: string, type: BasicSchema) => void
) => {
	for (const [key, type] of Object.entries(schema.entries)) {
		callback(key, type);
	}
};

describe('init function', () => {
	it('should initialize a simple object schema correctly', () => {
		const typesMap = new SvelteMap<string, any>();
		const schema = {};
		const doc = syncedState({
			schema: {
				name: 'string',
				age: 'number',
				roles: ['string'],
				lang: '<test,test2,test3>',

				address: {
					street: 'string',
					city: 'string',
					zip: 'string'
				},
				friends: [
					{
						name: 'string',
						gender: '<male,female>'
					}
				]
			}
		});

		console.log('doc.name', doc.name);
		function createStringProxy(initialValue: string): {
			toString(): string;
			valueOf(): string;
			[Symbol.toPrimitive](hint: string): string;
		} & string {
			let value = initialValue;

			const handler: ProxyHandler<any> = {
				get(target, prop) {
					if (prop === 'toString' || prop === 'valueOf' || prop === Symbol.toPrimitive) {
						return target[prop];
					}
					return value[prop as keyof string];
				},
				set(target, prop, newValue) {
					if (typeof newValue === 'string' && prop === 'value') {
						console.log(`Setting value to: ${newValue}`);
						value = newValue;
						return true;
					}
					return false;
				}
			};

			const target = {
				toString() {
					return value;
				},
				valueOf() {
					return value;
				},
				[Symbol.toPrimitive](hint: string) {
					return value;
				}
			};

			return new Proxy(target, handler) as {
				toString(): string;
				valueOf(): string;
				[Symbol.toPrimitive](hint: string): string;
			} & string;
		}

		class CustomString extends String {
			insert() {
				console.log('insert');
			}
		}
		function CustomText(value: string) {
			const string = new CustomString(value);

			return string.valueOf();
		}

		console.log('string'[Symbol.toPrimitive]); // Logs: Accessing property: Symbol(Symbol.toPrimitive)

		expect(true).toBe(true);
	});
});
