import * as Y from 'yjs';
import type { ObjectValidator } from '../schemas/object.js';
import { type State, type SyncroStates } from './syncroState.svelte.js';
import { SyncedArray } from './array.svelte.js';
export declare class SyncedObject {
    state: State;
    validator: ObjectValidator<any>;
    yType: Y.Map<any>;
    syncroStates: Record<string, SyncroStates>;
    baseImplementation: {};
    proxy: any;
    parent: SyncedObject | SyncedArray;
    key: string | number;
    initialized: boolean;
    isNull: boolean;
    deleteProperty: (target: any, p: any) => boolean;
    setNull(): void;
    set value(input: any);
    get value(): any;
    constructor({ state, observe, validator, yType, baseImplementation, value, parent, key }: {
        state: State;
        observe?: boolean;
        validator: ObjectValidator<any>;
        yType: Y.Map<any>;
        baseImplementation?: any;
        value?: any;
        parent: SyncedObject | SyncedArray;
        key: string | number;
    });
    observe: (e: Y.YMapEvent<any>, _transaction: Y.Transaction) => void;
    toJSON: () => {};
    sync: (value?: any) => void;
    destroy: () => void;
}
