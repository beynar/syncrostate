import type { SchemaOutput } from '../schemas/schema.js';
import * as Y from 'yjs';
import { Awareness } from 'y-protocols/awareness';
import { objectHandler, observeObject } from './object.svelte.js';
import { ObjectValidator, type ObjectShape } from '$lib/schemas/object.js';
import { Integrator } from '../integrator.js';
import { createClient } from '@liveblocks/client';
import { LiveblocksYjsProvider } from '@liveblocks/yjs';
import { setContext, untrack } from 'svelte';

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

const remoteTest = false;
export function syncedState<T extends ObjectShape>({
	schema
}: {
	schema: T;
}): SchemaOutput<T> & StateExtras {
	let remotlySynced = $state<boolean>(!remoteTest);
	let locallySynced = $state<boolean>(false);
	let connectionStatus = $state<'CONNECTED' | 'DISCONNECTED' | 'CONNECTING'>('DISCONNECTED');
	const schemaState = $state(schema);
	const integrator = new Integrator();
	const doc = new Y.Doc();
	const awareness = new Awareness(doc);
	const schemaValidator = new ObjectValidator(schemaState);
	const stateMap = doc.getMap('$state');
	const syncedStateContext = $state({
		id: crypto.randomUUID()
	});

	$inspect(Array.from(integrator.syncedStates.keys()));

	setContext('SYNCED_STATE_CONTEXT', syncedStateContext);
	const stateObserver = observeObject({
		path: '',
		validator: schemaValidator,
		yType: stateMap,
		integrator
	});

	if (remoteTest) {
		const client = createClient({
			publicApiKey: 'pk_prod_TXiiCUekyBO_3gntGdLDEyqmJ0Qc6AqyfAoz0Pntk5JlzC4sSWFmjh4cP73rWXpm'
		});
		const { room } = client.enterRoom('your-room-id-4');
		const yProvider = new LiveblocksYjsProvider(room, doc);
		yProvider.on('synced', (synced: boolean) => {
			if (synced) {
				integrator.integrateObject({
					validator: schemaValidator,
					parent: doc,
					cleanUp: false,
					key: '',
					path: ''
				});
				remotlySynced = true;
				stateMap.observe(stateObserver);
			}
		});
	} else {
		console.log('integrate');
		integrator.integrateObject({
			validator: schemaValidator,
			parent: doc,
			cleanUp: false,
			key: '',
			path: ''
		});
		stateMap.observe(stateObserver);
	}

	console.log('init');

	const undoManager = new Y.UndoManager(doc.getMap('$state'));

	return new Proxy(
		{
			$doc: doc,
			$state: stateMap,
			$connected: false,
			$connectionStatus: connectionStatus,
			$destroy: () => {
				stateMap.unobserve(stateObserver);
				undoManager.destroy();
				awareness.destroy();
			},
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
		objectHandler(schemaState, '', doc.getMap('$state'), integrator)
	);
}
