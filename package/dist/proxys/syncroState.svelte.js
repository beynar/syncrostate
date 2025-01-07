import * as Y from 'yjs';
import { Awareness } from 'y-protocols/awareness';
import { SyncedObject } from './object.svelte.js';
import { ObjectValidator } from '../schemas/object.js';
import { SyncedEnum } from './enum.svelte.js';
import { SyncedDate } from './date.svelte.js';
import { SyncedBoolean } from './boolean.svelte.js';
import { SyncedText } from './text.svelte.js';
import { SyncedNumber } from './number.svelte.js';
import { getTypeFromParent } from '../utils.js';
import { getInitialStringifiedValue } from './base.svelte.js';
import { onMount, setContext } from 'svelte';
import { CONTEXT_KEY } from '../constants.js';
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
const remoteTest = false;
export const syncroState = ({ schema, connect }) => {
    let remotlySynced = $state(false);
    let locallySynced = $state(false);
    let connectionStatus = $state('DISCONNECTED');
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
    onMount(() => {
        if (connect) {
            connect?.({ doc, awareness }).then(() => {
                syncroStateProxy.sync(syncroStateProxy.value);
                stateMap.observe(syncroStateProxy.observe);
                remotlySynced = true;
            });
        }
        else {
            syncroStateProxy.sync(syncroStateProxy.value);
            stateMap.observe(syncroStateProxy.observe);
            remotlySynced = true;
        }
    });
    return syncroStateProxy.value;
};
export const createSyncroState = ({ key, validator, parent, forceNewType, value }) => {
    const initialValue = getInitialStringifiedValue(value, validator);
    const type = getTypeFromParent({ forceNewType, parent, key, validator, value: initialValue });
    switch (validator.$schema.kind) {
        default:
        case 'string': {
            return new SyncedText(type, validator);
        }
        case 'number': {
            return new SyncedNumber(type, validator);
        }
        case 'boolean': {
            return new SyncedBoolean(type, validator);
        }
        case 'date': {
            return new SyncedDate(type, validator);
        }
        case 'enum': {
            return new SyncedEnum(type, validator);
        }
        case 'object': {
            return new SyncedObject({
                yType: type,
                validator: validator,
                baseImplementation: {},
                value
            });
        }
        case 'array': {
            return new SyncedArray({
                yType: type,
                validator: validator,
                value
            });
        }
    }
};
