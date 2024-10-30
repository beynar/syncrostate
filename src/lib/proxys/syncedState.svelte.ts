import { traverseSchema } from '$lib/traverse.js';
import type { Primitive, Schema, SchemaOutput } from '$lib/types.js';
import { SvelteMap } from 'svelte/reactivity';
import * as Y from 'yjs';
import { Awareness } from 'y-protocols/awareness';
import { SyncedText } from './text.svelte.js';
import { syncedObject } from './object.svellte.js';
import { toJSON } from '$lib/toJSON.js';
import { SyncedNumber } from './number.svelte.js';

type StateExtras = {
	$doc: Y.Doc;
	$connected: boolean;
	$connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING';
	$remotlySynced: boolean;
	$locallySynced: boolean;
	$undo: () => void;
	$redo: () => void;
	$awareness: Awareness;
};

type SyncedState =
	| {
			type: Y.Map<any>;
			schema: Schema;
			state?: null;
	  }
	| {
			type: Y.Text;
			schema: Primitive;
			state: SyncedText | SyncedNumber;
	  };
export type SyncedStates = SvelteMap<string, SyncedState>;

export function syncedState<T extends Schema>({
	schema
}: {
	schema: T;
}): SchemaOutput<T> & StateExtras {
	const syncedStates = new SvelteMap<string, SyncedState>();
	let remotlySynced = $state<boolean>(false);
	let locallySynced = $state<boolean>(false);
	let connectionStatus = $state<'CONNECTED' | 'DISCONNECTED' | 'CONNECTING'>('DISCONNECTED');
	let undoManager = $state<Y.UndoManager>();

	const doc = traverseSchema({
		schema,
		follower: {},
		onType: (p) => {
			if (p.isRoot) {
				if (!undoManager) {
					undoManager = new Y.UndoManager(p.type, {
						trackedOrigins: new Set(['INTERNAL'])
					});
				} else {
					undoManager.addToScope(p.type);
				}
			}
			if (p.type instanceof Y.Text) {
				switch (p.schema) {
					case 'string': {
						syncedStates.set(p.path, {
							type: p.type,
							schema: p.schema,
							state: new SyncedText(p.type, p.schema as Primitive)
						});
						break;
					}
					case 'number': {
						syncedStates.set(p.path, {
							type: p.type,
							schema: p.schema,
							state: new SyncedNumber(p.type, p.schema as Primitive)
						});
						break;
					}
				}
			} else if (p.type instanceof Y.Map) {
				syncedStates.set(p.path, {
					type: p.type as Y.Map<any>,
					schema: p.schema as Schema
				});
			}
		}
	});
	const awareness = new Awareness(doc);

	const proxy = new Proxy(
		{
			$doc: doc,
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
		} as SchemaOutput<T> & StateExtras,
		{
			set: (target, p, value) => {
				if (typeof p !== 'string') {
					throw new Error();
				}

				const syncedText = syncedStates.get(p);
				if (syncedText?.state) {
					syncedText.state.value = value;
					return true;
				} else {
					throw new Error('cannot set new elements on root doc');
				}
			},

			get: (target, p, receiver) => {
				if (typeof p !== 'string') {
					return Reflect.get(target, p);
				}
				if (p[0] === '$') {
					return Reflect.get(target, p);
				}

				if (p === 'toJSON') {
					return toJSON('', doc, syncedStates);
				}

				const syncedState = syncedStates.get(p);

				if (!syncedState) {
					throw new Error('type not found');
				}

				if (syncedState?.type instanceof Y.Map) {
					return syncedObject({
						yType: syncedState.type,
						path: p,
						syncedStates,
						schema: syncedState.schema as Schema
					});
				}
				if (syncedState?.type instanceof Y.Text) {
					return syncedState.state?.value;
				}

				throw new Error('type not found');
			},
			deleteProperty: (target, p) => {
				throw new Error('deleteProperty not available for doc');
			},
			has: (target, p) => {
				if (typeof p === 'string' && doc.share.has(p)) {
					return true;
				}
				return false;
			},
			getOwnPropertyDescriptor(target, p) {
				if ((typeof p === 'string' && doc.share.has(p)) || p === 'toJSON') {
					return {
						enumerable: true,
						configurable: true
					};
				}
				return undefined;
			},
			ownKeys: (target) => {
				return Array.from(doc.share.keys());
			}
		}
	);

	return proxy;
}
