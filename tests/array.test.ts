import { describe, it, expect } from 'vitest';

import * as Y from 'yjs';

describe('init function', () => {
	it('should initialize a simple object schema correctly', () => {
		const doc = new Y.Doc();

		const array = doc.getArray('array');
		array.insert(0, [new Y.Text('hello')]);
		array.observe((e: Y.YArrayEvent<any>, transaction: Y.Transaction) => {
			const added = Array.from(e.changes?.added).map((value) => {
				// console.log(array.toArray());
				console.log(array.toArray().findIndex((v) => v._item.id === value.id));
			});
		});

		console.log(array.toJSON());

		array.insert(1, [new Y.Text('world')]);
	});
});
