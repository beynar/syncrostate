import * as Y from 'yjs';
import { SvelteMap } from 'svelte/reactivity';
import { logError } from '../utils.js';
import { createSyncroState } from './syncroState.svelte.js';
import { NULL_OBJECT } from '../constants.js';
export class SyncedMap {
    state;
    validator;
    yType;
    parent;
    key;
    isNull = $state(false);
    syncroStates = new SvelteMap();
    syncroStatesValues = new SvelteMap();
    constructor(opts) {
        this.key = opts.key;
        this.state = opts.state;
        this.yType = opts.yType;
        this.parent = opts.parent;
        this.validator = opts.validator;
        this.sync(opts.value);
        this.yType.observe(this.observe);
    }
    deleteProperty = (_target, p) => {
        if (typeof p !== 'string') {
            return true;
        }
        const syncroState = this.syncroStates.get(p);
        if (!syncroState) {
            logError('Property does not exist', p);
            return true;
        }
        syncroState.destroy();
        this.yType.delete(p);
        this.syncroStates.delete(p);
        this.syncroStatesValues.delete(p);
        return true;
    };
    setNull() {
        this.state.transaction(() => {
            this.syncroStates.forEach((state) => state.destroy());
            this.syncroStatesValues.clear();
            this.syncroStates.clear();
            this.isNull = true;
            this.yType.set(NULL_OBJECT, new Y.Text(NULL_OBJECT));
        });
    }
    observe = (e, _transaction) => {
        if (_transaction.origin !== this.state.transactionKey) {
            if (this.yType.has(NULL_OBJECT)) {
                this.isNull = true;
                this.syncroStates.forEach((state) => state.destroy());
                this.syncroStates.clear();
                this.syncroStatesValues.clear();
                return;
            }
            e.changes?.keys.forEach(({ action }, key) => {
                const syncedState = this.syncroStates.get(key);
                if (action === 'delete' && syncedState) {
                    syncedState.destroy();
                    this.syncroStates.delete(key);
                    this.syncroStatesValues.delete(key);
                }
                if (action === 'add') {
                    // If a new key is added to the object and is valid, integrate it
                    const syncroState = createSyncroState({
                        key,
                        validator: this.validator.$schema.shape,
                        state: this.state,
                        parent: this
                    });
                    this.addState(key, syncroState);
                }
            });
        }
    };
    addState = (key, state) => {
        this.syncroStates.set(key, state);
        this.syncroStatesValues.set(key, state.value);
    };
    addValue = (key, value) => {
        const state = createSyncroState({
            key,
            validator: this.validator.$schema.shape,
            parent: this,
            value,
            state: this.state
        });
        this.addState(key, state);
    };
    sync = (value) => {
        this.state.transaction(() => {
            this.syncroStates.clear();
            this.syncroStatesValues.clear();
            if (this.yType.has(NULL_OBJECT)) {
                this.isNull = true;
                return;
            }
            if (value) {
                Object.entries(value).forEach(([key, value]) => {
                    this.addValue(key, value);
                });
            }
            else if (this.state.initialized) {
                this.yType.forEach((value, key) => {
                    this.addValue(key, value);
                });
            }
            else if (this.validator.$schema.default) {
                this.validator.$schema.default?.forEach((value, key) => {
                    this.addValue(key, value);
                });
            }
            else if (this.validator.$schema.nullable && !value) {
                this.setNull();
            }
        });
    };
    toJSON = () => {
        return Object.fromEntries(this.syncroStates.entries());
    };
    destroy = () => {
        this.syncroStates.clear();
        this.yType.unobserve(this.observe);
    };
    proxyMap = new Proxy(this.syncroStatesValues, {
        get: (target, prop) => {
            if (prop === 'getState') {
                return () => this.state;
            }
            if (prop === 'getYType') {
                return () => this.yType;
            }
            if (prop === 'getYTypes') {
                return () => Object.fromEntries(this.yType.entries());
            }
            if (prop === Symbol.iterator) {
                return () => this.syncroStatesValues.entries();
            }
            const result = Reflect.get(target, prop);
            if (typeof result === 'function') {
                return (...args) => {
                    if (typeof prop === 'string') {
                        switch (prop) {
                            case 'set': {
                                const [key, value] = args;
                                const { isValid, value: parsedValue } = this.validator.$schema.shape.parse(value);
                                console.log({ isValid, value: parsedValue });
                                if (!isValid) {
                                    logError('Invalid value', { value });
                                    return false;
                                }
                                const hasValue = this.syncroStates.has(value);
                                if (hasValue) {
                                    return false;
                                }
                                this.state.transaction(() => {
                                    const state = createSyncroState({
                                        forceNewType: true,
                                        key,
                                        validator: this.validator.$schema.shape,
                                        parent: this,
                                        value: value,
                                        state: this.state
                                    });
                                    this.addState(key, state);
                                });
                                return this.proxyMap;
                            }
                            case 'delete': {
                                this.deleteProperty(target, args[0]);
                                return this.proxyMap;
                            }
                            case 'clear':
                                {
                                    this.state.transaction(() => {
                                        this.syncroStates.forEach((state) => state.destroy());
                                        this.yType.clear();
                                        this.syncroStatesValues.clear();
                                        this.syncroStates.clear();
                                    });
                                }
                                return this.proxyMap;
                            default:
                                break;
                        }
                        return result.call(target, ...args);
                    }
                };
            }
            else {
                return result;
            }
        }
    });
    get value() {
        if (this.isNull) {
            return null;
        }
        return this.proxyMap;
    }
    set value(input) {
        const { isValid, value } = this.validator.parse(input);
        this.state.transaction(() => {
            if (!isValid) {
                logError('Invalid value', { value });
                return;
            }
            else {
                if (!value) {
                    if (value === undefined) {
                        this.parent.deleteProperty({}, this.key);
                    }
                    else {
                        this.setNull();
                    }
                }
                else {
                    if (this.isNull) {
                        this.isNull = false;
                        this.yType.delete(NULL_OBJECT);
                    }
                    if (!this.isNull) {
                        const remainingStates = Array.from(this.syncroStates.keys()).filter((key) => !(key in value));
                        remainingStates.forEach((key) => {
                            this.deleteProperty({}, key);
                        });
                    }
                    Array.from(value.entries()).forEach(([key, value]) => {
                        const state = this.syncroStates.get(key);
                        if (state) {
                            state.value = value;
                            this.syncroStatesValues.set(key, value);
                        }
                        else {
                            const { isValid, value: parsedValue } = this.validator.$schema.shape.parse(value);
                            if (isValid) {
                                this.addValue(key, parsedValue);
                            }
                        }
                    });
                }
            }
        });
    }
}
