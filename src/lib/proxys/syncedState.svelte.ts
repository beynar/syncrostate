import { traverseShape } from '../schemas/traverse.js';
import type { SchemaOutput } from '../schemas/schema.js';
import * as Y from 'yjs';
import { Awareness } from 'y-protocols/awareness';
import { objectHandler } from './object.svellte.js';
import type { ObjectShape } from '$lib/schemas/object.js';
import { SyncedCache } from './syncedCache.svelte.js';
import { UNDEFINED } from '$lib/constants.js';
import { BROWSER } from 'esm-env';
import { onMount } from 'svelte';

import { createClient } from '@liveblocks/client';
import { LiveblocksYjsProvider } from '@liveblocks/yjs';
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

const remoteTest = true;
export function syncedState<T extends ObjectShape>({
	schema
}: {
	schema: T;
}): SchemaOutput<T> & StateExtras {
	let currentKeys = new Set<string>();
	let remotlySynced = $state<boolean>(!remoteTest);
	let locallySynced = $state<boolean>(false);
	let connectionStatus = $state<'CONNECTED' | 'DISCONNECTED' | 'CONNECTING'>('DISCONNECTED');
	let undoManager = $state<Y.UndoManager>();

	const syncedCache = new SyncedCache(undoManager);
	const doc = new Y.Doc();

	if (remoteTest) {
		const client = createClient({
			publicApiKey: 'pk_prod_TXiiCUekyBO_3gntGdLDEyqmJ0Qc6AqyfAoz0Pntk5JlzC4sSWFmjh4cP73rWXpm'
		});
		const { room, leave } = client.enterRoom('your-room-id');
		const yProvider = new LiveblocksYjsProvider(room, doc);
		yProvider.on('synced', (e) => {
			console.log('synced', e, room.getPresence());
			remotlySynced = true;
			traverseShape({
				shape: schema,
				parent: doc.getMap('$state'),
				follower: {},
				syncedCache
			});
		});
	} else {
		traverseShape({
			shape: schema,
			parent: doc.getMap('$state'),
			follower: {},
			syncedCache
		});
	}
	const awareness = new Awareness(doc);

	const proxy = new Proxy(
		{
			$doc: doc,
			$state: doc.getMap('$state'),
			$connected: false,
			$connectionStatus: 'DISCONNECTED',
			get $remotlySynced() {
				return remotlySynced;
			},
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
