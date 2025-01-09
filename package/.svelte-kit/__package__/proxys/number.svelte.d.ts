import * as Y from 'yjs';
import type { NumberValidator } from '../schemas/number.js';
import { BaseSyncedType } from './base.svelte.js';
import type { SyncedObject } from './object.svelte.js';
import type { SyncedArray } from './array.svelte.js';
import type { State } from './syncroState.svelte.js';
export declare class SyncedNumber extends BaseSyncedType {
    validator: NumberValidator;
    get value(): number | null;
    set value(value: number | null);
    constructor(opts: {
        yType: Y.Text;
        validator: NumberValidator;
        parent: SyncedObject | SyncedArray;
        key: string | number;
        state: State;
    });
}
