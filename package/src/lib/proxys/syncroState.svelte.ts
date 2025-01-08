import type { SchemaOutput } from '../schemas/schema.js';
import * as Y from 'yjs';
import { Awareness } from 'y-protocols/awareness';
import { SyncedObject } from './object.svelte.js';
import { ObjectValidator, type ObjectShape } from '../schemas/object.js';
import type { Validator } from '../schemas/schema.js';
import { SyncedEnum } from './enum.svelte.js';
import { SyncedDate } from './date.svelte.js';
import { SyncedBoolean } from './boolean.svelte.js';
import type { StringValidator } from '../schemas/string.js';
import type { NumberValidator } from '../schemas/number.js';
import type { EnumValidator } from '../schemas/enum.js';
import type { DateValidator } from '../schemas/date.js';
import type { BooleanValidator } from '../schemas/boolean.js';
import { SyncedText } from './text.svelte.js';
import { SyncedNumber } from './number.svelte.js';
import { getInitialStringifiedValue, getTypeFromParent } from '../utils.js';
import { onMount, setContext } from 'svelte';
import { CONTEXT_KEY } from '$lib/constants.js';
import { SyncedArray } from './array.svelte.js';
import type { ArrayValidator } from '$lib/schemas/array.js';

export type SyncroStates =
	| SyncedText
	| SyncedNumber
	| SyncedBoolean
	| SyncedDate
	| SyncedEnum
	| SyncedObject
	| SyncedArray;

// For testing purpose
const safeSetContext = (key: string, value: any) => {
	try {
		setContext(key, value);
	} catch (e) {
		//
	}
};

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

export const syncroState = <T extends ObjectShape>({
	schema,
	connect
}: {
	schema: T;
	connect?: ({ doc, awareness }: { doc: Y.Doc; awareness: Awareness }) => Promise<void>;
}): SchemaOutput<T> & StateExtras => {
	let remotlySynced = $state<boolean>(false);
	let locallySynced = $state<boolean>(connect ? false : true);
	let connectionStatus = $state<'CONNECTED' | 'DISCONNECTED' | 'CONNECTING'>('DISCONNECTED');
	const schemaState = $state(schema);
	const doc = new Y.Doc();
	const awareness = new Awareness(doc);
	const schemaValidator = new ObjectValidator(schemaState);
	const stateMap = doc.getMap('$state');
	const syncroStateContext = $state({
		id: crypto.randomUUID()
	});
	const undoManager = new Y.UndoManager(stateMap);

	safeSetContext(CONTEXT_KEY, syncroStateContext);

	const syncroStateProxy = new SyncedObject({
		parent: stateMap as any,
		key: '$state',
		validator: schemaValidator,
		observe: false,
		yType: stateMap,
		baseImplementation: {
			$doc: doc,
			$state: stateMap,
			$connected: false,
			$connectionStatus: connectionStatus,
			$destroy: () => {
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
		}
	});

	if (!connect) {
		syncroStateProxy.sync(syncroStateProxy.value);
		stateMap.observe(syncroStateProxy.observe);
	}

	onMount(() => {
		if (connect) {
			connect({ doc, awareness }).then(() => {
				syncroStateProxy.sync(syncroStateProxy.value);
				stateMap.observe(syncroStateProxy.observe);
				remotlySynced = true;
			});
		}
	});

	return syncroStateProxy.value;
};

export const createSyncroState = ({
	key,
	validator,
	forceNewType,
	value,
	parent
}: {
	key: string | number;
	validator: Validator;
	value?: any;
	forceNewType?: boolean;
	parent: SyncedObject | SyncedArray;
}): SyncroStates => {
	const type = getTypeFromParent({ forceNewType, parent: parent.yType, key, validator, value });

	switch (validator.$schema.kind) {
		default:
		case 'string': {
			return new SyncedText(type as Y.Text, validator as StringValidator, parent, key);
		}
		case 'number': {
			return new SyncedNumber(type as Y.Text, validator as NumberValidator, parent, key);
		}
		case 'boolean': {
			return new SyncedBoolean(type as Y.Text, validator as BooleanValidator, parent, key);
		}
		case 'date': {
			return new SyncedDate(type as Y.Text, validator as DateValidator, parent, key);
		}
		case 'enum': {
			return new SyncedEnum(type as Y.Text, validator as EnumValidator<any, any, any>, parent, key);
		}
		case 'object': {
			return new SyncedObject({
				yType: type as Y.Map<any>,
				validator: validator as ObjectValidator<any>,
				baseImplementation: {},
				value,
				parent: parent,
				key
			});
		}
		case 'array': {
			return new SyncedArray({
				yType: type as Y.Array<any>,
				validator: validator as ArrayValidator<any>,
				value,
				parent: parent,
				key
			});
		}
	}
};
