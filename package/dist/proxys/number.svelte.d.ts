import * as Y from 'yjs';
import type { NumberValidator } from '../schemas/number.js';
import { BaseSyncedType } from './base.svelte.js';
import type { SyncedContainer } from './common.js';
import type { State } from './syncroState.svelte.js';
export declare class SyncedNumber extends BaseSyncedType {
    validator: NumberValidator;
    get value(): number | null;
    set value(value: number | null);
    constructor(opts: {
        yType: Y.Text;
        validator: NumberValidator;
        parent: SyncedContainer;
        key: string | number;
        state: State;
    });
}
