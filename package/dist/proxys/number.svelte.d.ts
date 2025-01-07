import * as Y from 'yjs';
import type { NumberValidator } from '../schemas/number.js';
import { BaseSyncedType } from './base.svelte.js';
export declare class SyncedNumber extends BaseSyncedType {
    validator: NumberValidator;
    get value(): number | null;
    set value(value: number | null);
    constructor(yType: Y.Text, validator: NumberValidator);
}
