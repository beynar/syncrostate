import { SvelteMap } from 'svelte/reactivity';
import { traverseSchema } from './traverse.js';
import type { Schema, SchemaOutput, Simplify } from './types.js';
import * as Y from 'yjs';

const toYjs = (schema: Schema, object: any) => {};

export const createProxy = <T extends Schema, D = undefined, Enforce extends boolean = false>(
	schema: T,
	object: any
) => {
	const typesMap = new SvelteMap<string, Y.AbstractType<any>>();
	traverseSchema({
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
				const newPath = path ? `${path}.${key}` : key;
				const yType = typesMap.get(newPath);
				console.log('yType', newPath);
				console.log('yType', Array.from(typesMap.keys()), yType instanceof Y.Array);
				if (yType instanceof Y.Map || yType instanceof Y.Array) {
					return createProxy({
						path: path ? `${path}.${key}` : key,
						set(target, key, value) {
							console.log({ path, key, value });
							return true;
						}
					});
				} else {
					// console.log(typesMap.keys());
					return typesMap.get(path ? `${path}.${key}` : key);
				}
			},
			set
		};
		return new Proxy({} as any, handler) as Simplify<SchemaOutput<T, D, Enforce>>;
	};

	return createProxy({ path: '', set: () => true });
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

const proxy = createProxy(schema, { name: 'John', array: ['hello'] });

console.log('is y array', proxy.array);

// console.log((proxy.array[0] as Y.Text)?.toString());
// Testting setter
proxy.nested.nested.nested = { age: 20 };
