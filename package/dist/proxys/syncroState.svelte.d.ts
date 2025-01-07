import type { SchemaOutput } from '../schemas/schema.js';
import * as Y from 'yjs';
import { Awareness } from 'y-protocols/awareness';
import { SyncedObject } from './object.svelte.js';
import { type ObjectShape } from '../schemas/object.js';
import type { Validator } from '../schemas/schema.js';
import { SyncedEnum } from './enum.svelte.js';
import { SyncedDate } from './date.svelte.js';
import { SyncedBoolean } from './boolean.svelte.js';
import { SyncedText } from './text.svelte.js';
import { SyncedNumber } from './number.svelte.js';
import { SyncedArray } from './array.svelte.js';
export type SyncroStates = SyncedText | SyncedNumber | SyncedBoolean | SyncedDate | SyncedEnum | SyncedObject | SyncedArray;
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
export declare const syncroState: <T extends ObjectShape>({ schema, connect }: {
    schema: T;
    connect?: ({ doc, awareness }: {
        doc: Y.Doc;
        awareness: Awareness;
    }) => Promise<void>;
}) => SchemaOutput<T> & StateExtras;
export declare const createSyncroState: ({ key, validator, parent, forceNewType, value }: {
    parent: Y.Map<any> | Y.Array<any>;
    key: string | number;
    validator: Validator;
    value?: any;
    forceNewType?: boolean;
}) => SyncroStates;
export {};
