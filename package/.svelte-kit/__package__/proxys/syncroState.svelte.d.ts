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
import { Presence, type PresenceUser } from '../presence.svelte.js';
import { SyncedMap } from './map.svelte.js';
export type SyncroStates = SyncedText | SyncedNumber | SyncedBoolean | SyncedDate | SyncedEnum | SyncedObject | SyncedArray | SyncedSet | SyncedMap;
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
export declare const syncroState: <T extends ObjectShape, P extends ObjectShape>({ schema, sync, doc: customDoc, awareness: customAwareness, presence: p }: {
    schema: T;
    doc?: Y.Doc;
    awareness?: Awareness;
    presence?: Omit<PresenceUser, "$/_PRENSENCE_ID_/$">;
    sync?: ({ doc, awareness, synced }: {
        doc: Y.Doc;
        awareness: Awareness;
        synced: (provider?: any) => void;
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
