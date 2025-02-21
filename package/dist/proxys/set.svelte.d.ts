import * as Y from 'yjs';
import { SvelteSet } from 'svelte/reactivity';
import { type State, type SyncroStates } from './syncroState.svelte.js';
import type { SyncedContainer } from './common.js';
import type { SetValidator } from '../schemas/set.js';
export declare class SyncedSet {
    state: State;
    validator: SetValidator<any>;
    yType: Y.Array<any>;
    parent: SyncedContainer;
    key: string | number;
    isNull: boolean;
    syncroStates: SyncroStates[];
    syncroStatesValues: SvelteSet<any[]>;
    setNull: () => void;
    observe: (e: Y.YArrayEvent<any>, _transaction: Y.Transaction) => void;
    constructor(opts: {
        yType: Y.Array<any>;
        validator: SetValidator<any>;
        parent: SyncedContainer;
        key: string | number;
        state: State;
        value: any;
    });
    sync: (value: any) => void;
    toJSON: () => any[];
    addState: (state: SyncroStates) => void;
    deleteProperty: (target: any, prop: any) => true | undefined;
    destroy: () => void;
    proxySet: SvelteSet<any[]>;
    get value(): Set<any> | null;
    set value(input: Set<any> | null);
}
