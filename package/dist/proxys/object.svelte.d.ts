import * as Y from 'yjs';
import type { ObjectValidator } from '../schemas/object.js';
import { type SyncroStates } from './syncroState.svelte.js';
export declare class SyncedObject {
    INTERNAL_ID: string;
    validator: ObjectValidator<any>;
    yType: Y.Map<any>;
    syncroStates: Record<string, SyncroStates>;
    baseImplementation: {};
    proxy: any;
    private deleteProperty;
    private transact;
    set value(value: any);
    get value(): any;
    constructor({ observe, validator, yType, baseImplementation, value }: {
        observe?: boolean;
        validator: ObjectValidator<any>;
        yType: Y.Map<any>;
        baseImplementation?: any;
        value?: any;
    });
    observe: (e: Y.YMapEvent<any>, _transaction: Y.Transaction) => void;
    toJSON: () => {};
    sync: (value?: any) => void;
    destroy: () => void;
}
