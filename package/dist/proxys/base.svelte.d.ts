import * as Y from 'yjs';
import type { SyncedContainer } from './common.js';
import type { State } from './syncroState.svelte.js';
type ObserverCallback = (e: Y.YEvent<Y.Text>, transact: Y.Transaction) => void;
export declare class BaseSyncedType {
    yType: Y.Text;
    rawValue: string | null;
    observeCallback?: ObserverCallback;
    state: State;
    parent: SyncedContainer;
    key: string | number;
    constructor(opts: {
        yType: Y.Text;
        key: string | number;
        parent: SyncedContainer;
        state: State;
    });
    deletePropertyFromParent: () => void;
    observe: (e: Y.YEvent<Y.Text>, transact: Y.Transaction) => void;
    destroy: () => void;
    setYValue(value: string | null): void;
}
export {};
