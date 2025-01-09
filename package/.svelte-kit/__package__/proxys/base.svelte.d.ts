import * as Y from 'yjs';
import type { SyncedArray } from './array.svelte.js';
import type { SyncedObject } from './object.svelte.js';
import type { State } from './syncroState.svelte.js';
type ObserverCallback = (e: Y.YEvent<Y.Text>, transact: Y.Transaction) => void;
export declare class BaseSyncedType {
    yType: Y.Text;
    rawValue: string | null;
    observeCallback?: ObserverCallback;
    state: State;
    parent: SyncedObject | SyncedArray;
    key: string | number;
    constructor(opts: {
        yType: Y.Text;
        key: string | number;
        parent: SyncedObject | SyncedArray;
        state: State;
    });
    deletePropertyFromParent: () => void;
    observe: (e: Y.YEvent<Y.Text>, transact: Y.Transaction) => void;
    destroy: () => void;
    setYValue(value: string | null): void;
}
export {};
