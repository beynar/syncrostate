import * as Y from 'yjs';
import type { DateValidator } from '../schemas/date.js';
import { SvelteDate } from 'svelte/reactivity';
import { BaseSyncedType } from './base.svelte.js';
import type { SyncedArray } from './array.svelte.js';
import type { SyncedObject } from './object.svelte.js';
import type { State } from './syncroState.svelte.js';
export declare class SyncedDate extends BaseSyncedType {
    validator: DateValidator;
    date: SvelteDate;
    get value(): Date | null | string | number;
    set value(value: Date | null | string | number);
    setValue: (string: string | null) => void;
    observeCallback: () => void;
    constructor(opts: {
        yType: Y.Text;
        validator: DateValidator;
        parent: SyncedObject | SyncedArray;
        key: string | number;
        state: State;
    });
}
