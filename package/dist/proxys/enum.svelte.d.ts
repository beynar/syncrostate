import * as Y from 'yjs';
import type { EnumValidator } from '../schemas/enum.js';
import { BaseSyncedType } from './base.svelte.js';
import type { SyncedObject } from './object.svelte.js';
import type { SyncedArray } from './array.svelte.js';
import type { State } from './syncroState.svelte.js';
export declare class SyncedEnum<T extends string | number = string | number> extends BaseSyncedType {
    validator: EnumValidator<T, false, false>;
    private firstValue;
    get value(): T | null;
    set value(value: T | null);
    constructor(opts: {
        yType: Y.Text;
        validator: EnumValidator<T>;
        parent: SyncedObject | SyncedArray;
        key: string | number;
        state: State;
    });
}
