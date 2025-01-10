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
import type { SyncedContainer } from './common.js';
import { SyncedSet } from './set.svelte.js';
export type SyncroStates = SyncedText | SyncedNumber | SyncedBoolean | SyncedDate | SyncedEnum | SyncedObject | SyncedArray | SyncedSet;
export type State = {
    synced: boolean;
    awareness: Awareness;
    doc: Y.Doc;
    undoManager: Y.UndoManager;
    initialized: boolean;
    transaction: (fn: () => void) => void;
    transactionKey: any;
    undo: () => void;
    redo: () => void;
};
export declare const syncroState: <T extends ObjectShape>({ schema, sync }: {
    schema: T;
    sync?: ({ doc, awareness, synced }: {
        doc: Y.Doc;
        awareness: Awareness;
        synced: () => void;
    }) => Promise<void>;
}) => SchemaOutput<T>;
export declare const createSyncroState: ({ key, validator, forceNewType, value, parent, state }: {
    key: string | number;
    validator: Validator;
    value?: any;
    forceNewType?: boolean;
    parent: SyncedContainer;
    state: State;
}) => SyncroStates;
