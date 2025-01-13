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
import { getTypeFromParent, logError } from '../utils.js';
import { onMount, setContext } from 'svelte';
import { CONTEXT_KEY, INITIALIZED, TRANSACTION_KEY } from '../constants.js';
import { SyncedArray } from './array.svelte.js';
import type { ArrayValidator } from '../schemas/array.js';
import type { SyncedContainer } from './common.js';
import { SyncedSet } from './set.svelte.js';
import type { SetValidator } from '../schemas/set.js';
import { Presence, type PresenceUser } from '$lib/presence.svelte.js';
import { SyncedMap } from './map.svelte.js';
import type { MapValidator } from '$lib/schemas/map.js';

export type SyncroStates =
	| SyncedText
	| SyncedNumber
	| SyncedBoolean
	| SyncedDate
	| SyncedEnum
	| SyncedObject
	| SyncedArray
	| SyncedSet
	| SyncedMap;

// For testing purpose
const safeSetContext = (key: string, value: any) => {
	try {
		setContext(key, value);
	} catch (e) {
		//
	}
};

export type State<P extends ObjectShape = ObjectShape> = {
	synced: boolean;
	awareness: Awareness;
	doc: Y.Doc;
	undoManager: Y.UndoManager;
	initialized: boolean;
	transaction: (fn: () => void) => void;
	transactionKey: any;
	presence: Presence<P>;
	undo: () => void;
	redo: () => void;
};

export const syncroState = <T extends ObjectShape, P extends ObjectShape>({
	schema,
	sync,
	doc: customDoc,
	awareness: customAwareness,
	presence: p
}: {
	schema: T;
	doc?: Y.Doc;
	awareness?: Awareness;
	presence?: Omit<PresenceUser, '$/_PRENSENCE_ID_/$'>;
	sync?: ({
		doc,
		awareness,
		synced
	}: {
		doc: Y.Doc;
		awareness: Awareness;
		synced: (provider?: any) => void;
	}) => Promise<void>;
}): SchemaOutput<T> => {
	const doc = customDoc ?? new Y.Doc();
	const awareness = customAwareness ?? new Awareness(doc);
	const presence = new Presence({ doc, awareness });
	const schemaValidator = new ObjectValidator(schema);
	const stateMap = doc.getMap('$state');
	const undoManager = new Y.UndoManager(stateMap);
	const transactionKey = new TRANSACTION_KEY();
	let state = $state<State>({
		synced: sync ? false : true,
		initialized: false,
		awareness,
		doc,
		undoManager,
		presence: presence as Presence<P>,
		transaction: (fn: () => void) => {
			state.doc.transact(fn, transactionKey);
		},
		transactionKey,
		undo: () => {
			if (undoManager?.canUndo()) {
				undoManager.undo();
			}
		},
		redo: () => {
			if (undoManager?.canRedo()) {
				undoManager.redo();
			}
		}
	});
	safeSetContext(CONTEXT_KEY, state);

	const syncroStateProxy = new SyncedObject({
		// @ts-ignore
		parent: {
			// TODO: does this need to be fixed ? Is this even used a some point ? idk
			deleteProperty(target, pArg) {
				logError('Not allowed');
				return true;
			}
		},
		state,
		key: '$state',
		validator: schemaValidator,
		observe: false,
		yType: stateMap
	});

	const initialize = (doc: Y.Doc, cb: () => void) => {
		const text = doc.getText(INITIALIZED);
		const initialized = text?.toString() === INITIALIZED;
		Object.assign(doc, { initialized });
		state.initialized = initialized;
		cb();
		state.initialized = true;
		Object.assign(doc, { initialized: true });
		if (!initialized) {
			text.delete(0, text.length);
			text.insert(0, INITIALIZED);
		}
	};

	const synced = (provider?: any) => {
		initialize(doc, () => {
			syncroStateProxy.sync(syncroStateProxy.value);
			stateMap.observe(syncroStateProxy.observe);
			presence.init({ me: p, awareness: provider?.awareness });
			state.synced = true;
		});
	};

	if (!sync) {
		synced();
	}

	onMount(() => {
		if (sync) {
			sync({ doc, awareness, synced });
		}
	});

	return syncroStateProxy.value;
};

export const createSyncroState = ({
	key,
	validator,
	forceNewType,
	value,
	parent,
	state
}: {
	key: string | number;
	validator: Validator;
	value?: any;
	forceNewType?: boolean;
	parent: SyncedContainer;
	state: State;
}): SyncroStates => {
	const type = getTypeFromParent({ forceNewType, parent: parent.yType, key, validator, value });

	switch (validator.$schema.kind) {
		default:
		case 'string': {
			return new SyncedText({
				yType: type as Y.Text,
				validator: validator as StringValidator,
				parent,
				key,
				state
			});
		}
		case 'number': {
			return new SyncedNumber({
				yType: type as Y.Text,
				validator: validator as NumberValidator,
				parent,
				key,
				state
			});
		}
		case 'boolean': {
			return new SyncedBoolean({
				yType: type as Y.Text,
				validator: validator as BooleanValidator,
				parent,
				key,
				state
			});
		}
		case 'date': {
			return new SyncedDate({
				yType: type as Y.Text,
				validator: validator as DateValidator,
				parent,
				key,
				state
			});
		}
		case 'enum': {
			return new SyncedEnum({
				yType: type as Y.Text,
				validator: validator as EnumValidator<any, any, any>,
				parent,
				key,
				state
			});
		}
		case 'object': {
			return new SyncedObject({
				yType: type as Y.Map<any>,
				validator: validator as ObjectValidator<any>,
				baseImplementation: {},
				value,
				parent,
				key,
				state
			});
		}
		case 'set': {
			return new SyncedSet({
				yType: type as Y.Array<any>,
				validator: validator as SetValidator<any>,
				value,
				parent,
				key,
				state
			});
		}
		case 'array': {
			return new SyncedArray({
				yType: type as Y.Array<any>,
				validator: validator as ArrayValidator<any>,
				value,
				parent,
				key,
				state
			});
		}
		case 'map': {
			return new SyncedMap({
				yType: type as Y.Map<any>,
				validator: validator as MapValidator<any>,
				value,
				parent,
				key,
				state
			});
		}
	}
};
