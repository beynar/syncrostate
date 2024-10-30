import { SvelteMap } from 'svelte/reactivity';
import { traverseSchema } from './traverse.js';
import type { Schema, SchemaOutput, Simplify } from './types.js';
import * as Y from 'yjs';
import { createTextProxy, sText } from './types/text.svelte.js';

export const createProxy = <T extends Schema, D = undefined, Enforce extends boolean = false>(
	schema: T,
	object: any
) => {
	const typesMap = new SvelteMap<string, Y.AbstractType<any>>();
	const valueMap = new SvelteMap<string, sText>();
	const doc = traverseSchema({
		schema,
		follower: object,
		onType: (p) => {
			typesMap.set(p.path, p.type);
		}
	});

	const createProxy = ({
		path,
		set
	}: {
		path: string;
		set: (target: SchemaOutput<T>, key: string, value: any) => boolean;
	}) => {
		const handler: ProxyHandler<SchemaOutput<T>> = {
			get(target: SchemaOutput<T>, key: string) {
				if (key === '$doc') {
					return doc;
				}

				if (key === '$root') {
					return doc.getMap('root');
				}
				const newPath = path ? `${path}.${key}` : key;
				const yType = typesMap.get(newPath);

				if (yType instanceof Y.Map || yType instanceof Y.Array) {
					return createProxy({
						path: path ? `${path}.${key}` : key,
						set(target, key, value) {
							return true;
						}
					});
				} else {
					return createTextProxy(valueMap.get(newPath) || new sText(yType as Y.Text));
					// console.log(typesMap.keys());
				}
			},
			set
		};
		return new Proxy({} as any, handler) as Simplify<SchemaOutput<T, D, Enforce>>;
	};

	return createProxy({ path: '', set: () => true }) as Simplify<SchemaOutput<T, D, Enforce>> & {
		$doc: Y.Doc;
		$root: Y.Map<any>;
	};
};

const schema = {
	array: ['string'],
	nested: {
		nested: {
			nested: {
				age: 'number'
			}
		}
	}
} satisfies Schema;

export const proxy = createProxy(schema, { name: 'John', array: ['hello'] });

console.log('is y array', proxy.nested.nested.nested.age);

// console.log((proxy.array[0] as Y.Text)?.toString());
// Testting setter
proxy.nested.nested.nested = { age: 20 };
