import * as Y from 'yjs';
import type { EnumValidator } from '../schemas/enum.js';
import { BaseSyncedType } from './base.svelte.js';
export declare class SyncedEnum<T extends string | number = string | number> extends BaseSyncedType {
    validator: EnumValidator<T, false, false>;
    get value(): T | null;
    set value(value: T | null);
    constructor(yType: Y.Text, validator: EnumValidator<T>);
}
