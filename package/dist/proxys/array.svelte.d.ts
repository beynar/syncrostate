import * as Y from 'yjs';
import type { ArrayValidator } from '../schemas/array.js';
import { type SyncroStates } from './syncroState.svelte.js';
export declare class SyncedArray<T extends any = any> {
    INTERNAL_ID: `${string}-${string}-${string}-${string}-${string}`;
    validator: ArrayValidator<any>;
    yType: Y.Array<any>;
    syncroStates: SyncroStates[];
    proxy: any;
    private get array();
    private deleteProperty;
    set value(value: any[]);
    get value(): any[];
    constructor({ validator, yType, value }: {
        validator: ArrayValidator<any>;
        yType: Y.Array<any>;
        value: any[];
    });
    transact: (fn: () => void) => void;
    toJSON: () => any[];
    sync: (value?: any[]) => void;
    observe: (e: Y.YArrayEvent<any>, _transaction: Y.Transaction) => void;
    methods: {
        slice: (start?: number | undefined, end?: number | undefined) => any[];
        toReversed: () => any[];
        forEach: (cb: (value: T, index: number, array: T[]) => void) => void;
        every: (cb: (value: T, index: number, array: T[]) => boolean) => boolean;
        filter: (cb: (value: T, index: number, array: T[]) => boolean) => any[];
        find: (cb: (value: T, index: number, array: T[]) => boolean) => any;
        findIndex: (cb: (value: T, index: number, array: T[]) => boolean) => number;
        some: (cb: (value: T, index: number, array: T[]) => boolean) => boolean;
        includes: (value: T) => boolean;
        map: (cb: (value: T, index: number, array: T[]) => T) => T[];
        reduce: <X>(cb: (acc: X | undefined, value: T, index: number, array: T[]) => X, initialValue?: X) => any;
        indexOf: (value: T) => number;
        at: (index: number) => any;
        pop: () => any;
        shift: () => any;
        unshift: (...items: T[]) => undefined;
        push: (...items: T[]) => void;
        splice: (start: number, deleteCount: number, ..._items: T[]) => any[];
    };
    destroy: () => void;
}
