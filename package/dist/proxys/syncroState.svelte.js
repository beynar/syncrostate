import * as Y from 'yjs';
import { Awareness } from 'y-protocols/awareness';
import { SyncedObject } from './object.svelte.js';
import { ObjectValidator } from '../schemas/object.js';
import { SyncedEnum } from './enum.svelte.js';
import { SyncedDate } from './date.svelte.js';
import { SyncedBoolean } from './boolean.svelte.js';
import { SyncedText } from './text.svelte.js';
import { SyncedNumber } from './number.svelte.js';
import { getTypeFromParent, logError } from '../utils.js';
import { onMount, setContext } from 'svelte';
import { CONTEXT_KEY, INITIALIZED, TRANSACTION_KEY } from '../constants.js';
import { SyncedArray } from './array.svelte.js';
// For testing purpose
const safeSetContext = (key, value) => {
    try {
        setContext(key, value);
    }
    catch (e) {
        //
    }
};
export const syncroState = ({ schema, connect }) => {
    const doc = new Y.Doc();
    const awareness = new Awareness(doc);
    const schemaValidator = new ObjectValidator(schema);
    const stateMap = doc.getMap('$state');
    const undoManager = new Y.UndoManager(stateMap);
    let state = $state({
        remotlySynced: connect ? false : true,
        locallySynced: false,
        initialized: false,
        connectionStatus: 'DISCONNECTED',
        awareness,
        doc,
        undoManager,
        transaction: (fn) => {
            state.doc.transact(fn, TRANSACTION_KEY);
        },
        transactionKey: TRANSACTION_KEY,
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
    const initialize = (doc, cb) => {
        const text = doc.getText(INITIALIZED);
        const initialized = text?.toString() === INITIALIZED;
        console.log({ initialized });
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
    if (!connect) {
        initialize(doc, () => {
            syncroStateProxy.sync(syncroStateProxy.value);
            stateMap.observe(syncroStateProxy.observe);
        });
    }
    onMount(() => {
        if (connect) {
            connect({ doc, awareness }).then(() => {
                initialize(doc, () => {
                    syncroStateProxy.sync(syncroStateProxy.value);
                    stateMap.observe(syncroStateProxy.observe);
                    state.remotlySynced = true;
                });
            });
        }
    });
    return syncroStateProxy.value;
};
export const createSyncroState = ({ key, validator, forceNewType, value, parent, state }) => {
    const type = getTypeFromParent({ forceNewType, parent: parent.yType, key, validator, value });
    switch (validator.$schema.kind) {
        default:
        case 'string': {
            return new SyncedText({
                yType: type,
                validator: validator,
                parent,
                key,
                state
            });
        }
        case 'number': {
            return new SyncedNumber({
                yType: type,
                validator: validator,
                parent,
                key,
                state
            });
        }
        case 'boolean': {
            return new SyncedBoolean({
                yType: type,
                validator: validator,
                parent,
                key,
                state
            });
        }
        case 'date': {
            return new SyncedDate({
                yType: type,
                validator: validator,
                parent,
                key,
                state
            });
        }
        case 'enum': {
            return new SyncedEnum({
                yType: type,
                validator: validator,
                parent,
                key,
                state
            });
        }
        case 'object': {
            return new SyncedObject({
                yType: type,
                validator: validator,
                baseImplementation: {},
                value,
                parent,
                key,
                state
            });
        }
        case 'array': {
            return new SyncedArray({
                yType: type,
                validator: validator,
                value,
                parent,
                key,
                state
            });
        }
    }
};
