import type { BooleanValidator } from '../schemas/boolean.js';
import { BaseSyncedType } from './base.svelte.js';
import * as Y from 'yjs';
import type { SyncedObject } from './object.svelte.js';
import type { SyncedArray } from './array.svelte.js';
import type { State } from './syncroState.svelte.js';
export declare class SyncedBoolean extends BaseSyncedType {
    validator: BooleanValidator;
    get value(): boolean | null;
    set value(value: boolean | null);
    constructor(opts: {
        yType: Y.Text;
        validator: BooleanValidator;
        parent: SyncedObject | SyncedArray;
        key: string | number;
        state: State;
    });
}
