import type { StringValidator } from '../schemas/string.js';
import * as Y from 'yjs';
import { BaseSyncedType } from './base.svelte.js';
import type { State } from './syncroState.svelte.js';
import type { SyncedContainer } from './common.js';
export declare class SyncedText extends BaseSyncedType {
    validator: StringValidator;
    get value(): string | null;
    set value(value: string | null);
    constructor(opts: {
        yType: Y.Text;
        validator: StringValidator;
        parent: SyncedContainer;
        key: string | number;
        state: State;
    });
}
