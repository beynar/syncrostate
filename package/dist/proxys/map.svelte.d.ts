import * as Y from 'yjs';
import { SvelteMap } from 'svelte/reactivity';
import { type State, type SyncroStates } from './syncroState.svelte.js';
import type { SyncedContainer } from './common.js';
import type { MapValidator } from '../schemas/map.js';
export declare class SyncedMap {
    state: State;
    validator: MapValidator<any>;
    yType: Y.Map<any>;
    parent: SyncedContainer;
    key: string | number;
    isNull: boolean;
    syncroStates: SvelteMap<any, SyncroStates>;
    syncroStatesValues: SvelteMap<any, any>;
    constructor(opts: {
        yType: Y.Map<any>;
        validator: MapValidator<any>;
        parent: SyncedContainer;
        key: string | number;
        state: State;
        value: any;
    });
    deleteProperty: (_target: any, p: any) => boolean;
    setNull(): void;
    observe: (e: Y.YMapEvent<any>, _transaction: Y.Transaction) => void;
    addState: (key: string, state: SyncroStates) => void;
    addValue: (key: string, value: any) => void;
    sync: (value: any) => void;
    toJSON: () => any;
    destroy: () => void;
    proxyMap: SvelteMap<any, any>;
    get value(): Map<any, any> | null;
    set value(input: Map<any, any> | null);
}
