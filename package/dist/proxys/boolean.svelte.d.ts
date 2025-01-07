import type { BooleanValidator } from '../schemas/boolean.js';
import { BaseSyncedType } from './base.svelte.js';
import * as Y from 'yjs';
export declare class SyncedBoolean extends BaseSyncedType {
    validator: BooleanValidator;
    get value(): boolean | null;
    set value(value: boolean | null);
    constructor(yType: Y.Text, validator: BooleanValidator);
}
