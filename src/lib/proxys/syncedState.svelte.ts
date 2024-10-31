import { traverseShape } from '../schemas/traverse.js';
import type { SchemaOutput } from '../schemas/schema.js';
import * as Y from 'yjs';
import { Awareness } from 'y-protocols/awareness';
import { objectHandler } from './object.svellte.js';
import type { ObjectShape } from '$lib/schemas/object.js';
import { SyncedCache } from './syncedCache.svelte.js';
import { UNDEFINED } from '$lib/constants.js';
import { BROWSER } from 'esm-env';

type StateExtras = {
	$doc: Y.Doc;
	$connected: boolean;
	$state: Y.Map<any>;
	$connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING';
	$remotlySynced: boolean;
	$locallySynced: boolean;
	$undo: () => void;
	$redo: () => void;
	$awareness: Awareness;
};

export function syncedState<T extends ObjectShape>({
	schema
}: {
	schema: T;
}): SchemaOutput<T> & StateExtras {
	let currentKeys = new Set<string>();
	let remotlySynced = $state<boolean>(false);
	let locallySynced = $state<boolean>(false);
	let connectionStatus = $state<'CONNECTED' | 'DISCONNECTED' | 'CONNECTING'>('DISCONNECTED');
	let undoManager = $state<Y.UndoManager>();

	const syncedCache = new SyncedCache(undoManager);
	const doc = new Y.Doc();
	const awareness = new Awareness(doc);

	traverseShape({
		shape: schema,
		parent: doc.getMap('$state'),
		follower: {},
		syncedCache
	});

	const proxy = new Proxy(
		{
			$doc: doc,
			$state: doc.getMap('$state'),
			$connected: false,
			$connectionStatus: 'DISCONNECTED',
			$remotlySynced: remotlySynced,
			$locallySynced: locallySynced,
			$undo: () => {
				if (undoManager?.canUndo()) {
					undoManager.undo();
				}
			},
			$redo: () => {
				if (undoManager?.canRedo()) {
					undoManager.redo();
				}
			},
			$awareness: awareness,
			$snapshot: {}
		} as any,
		objectHandler(schema, '', doc.getMap('$state'), syncedCache)
	);

	return proxy;
}
