import * as Y from 'yjs';
import type { DateValidator } from '../schemas/date.js';
import { SvelteDate } from 'svelte/reactivity';
import { BaseSyncedType } from './base.svelte.js';
import type { SyncedContainer } from './common.js';
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
        parent: SyncedContainer;
        key: string | number;
        state: State;
    });
}
