import * as Y from 'yjs';
import { y } from '$lib/schemas/schema.js';
import { traverseShape } from '$lib/schemas/traverse.js';
import { describe, it, expect } from 'vitest';

describe('init function', () => {
	it('should initialize a simple object schema correctly', () => {
		const schema = {
			hello: y.string().default('world'),
			object: y.object({
				hello: y.string().default('world')
			}),
			array: y.array(y.string())
		};
		const doc = new Y.Doc();

		traverseShape({
			shape: schema,
			doc,
			onType: (p) => {
				console.log(p.validator.$schema.kind);
			}
		});

		console.log('hello', doc.getText('hello').toString(), '!');
		// doc.transact((t) => {
		// 	console.log('here', doc.getText('hello')._item?.delete(t));
		// });
		// doc.share.delete('hello');
		// console.log('there', doc.get('hello', Y.Map));
		// console.log('object: hello', doc.getMap('object').get('hello').toString());
	});
});
