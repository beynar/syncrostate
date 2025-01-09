import * as Y from 'yjs';
import { createSyncroState } from './syncroState.svelte.js';
import { isInitialized, logError, propertyToNumber } from '../utils.js';
import { NULL_ARRAY, STATE_SYMBOL } from '../constants.js';
const createYTypesArrayProxy = (yType) => {
    return new Proxy([], {
        get: (_target, key) => {
            const index = propertyToNumber(key);
            if (typeof index === 'number' && index >= 0 && index < yType.length) {
                return yType.get(index);
            }
            return undefined;
        }
    });
};
export class SyncedArray {
    state;
    validator;
    yType;
    parent;
    key;
    syncroStates = $state([]);
    proxy;
    initialized = false;
    isNull = $state(false);
    // array: any[] = $state(this.syncroStates.map((state) => state.value));
    //🚨 Using a derived would be preferable but it breaks the tests :/
    // private array = $derived(this.syncroStates.map((state) => state.value));
    get array() {
        return this.syncroStates.map((state) => state.value);
    }
    deleteProperty = (target, pArg) => {
        const p = propertyToNumber(pArg);
        if (typeof p !== 'number') {
            return true;
        }
        if (!this.validator.$schema.shape.$schema.optional) {
            logError('Can not delete non optional property', p);
            return true;
        }
        const syncroState = this.syncroStates[p];
        if (!syncroState) {
            logError('Index does not exist', p);
            return true;
        }
        syncroState.value = undefined;
        return true;
    };
    set value(input) {
        const { isValid, value } = this.validator.parse(input);
        if (!isValid) {
            logError('Invalid value', { value });
        }
        else {
            this.state.transaction(() => {
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
                        this.yType.delete(0, this.yType.length);
                    }
                    if (!this.isNull) {
                        const remainingStates = this.syncroStates.slice(value.length);
                        remainingStates.forEach((state) => {
                            state.destroy();
                        });
                        if (remainingStates.length) {
                            this.yType.delete(value.length, remainingStates.length);
                        }
                    }
                    // console.log('this.array', this.array, value);
                    this.syncroStates = value.map((item, index) => {
                        const previsousState = this.syncroStates[index];
                        // console.log({ item, index, previsousState: !!previsousState });
                        if (previsousState) {
                            previsousState.value = item;
                            return previsousState;
                        }
                        else {
                            return createSyncroState({
                                key: index,
                                forceNewType: true,
                                validator: this.validator.$schema.shape,
                                parent: this,
                                value: item,
                                state: this.state
                            });
                        }
                    });
                }
            });
        }
    }
    get value() {
        if (this.isNull) {
            return null;
        }
        return this.proxy;
    }
    constructor({ validator, yType, value, parent, key, state }) {
        this.validator = validator;
        this.yType = yType;
        this.parent = parent;
        this.key = key;
        this.initialized = isInitialized(this);
        this.state = state;
        yType.observe(this.observe);
        const shape = this.validator.$schema.shape;
        this.proxy = new Proxy([], {
            get: (target, pArg, receiver) => {
                if (pArg === 'getState') {
                    return () => state;
                }
                if (pArg === 'getType') {
                    return () => this.yType;
                }
                if (pArg === 'getTypes') {
                    return () => createYTypesArrayProxy(this.yType);
                }
                const p = propertyToNumber(pArg);
                if (Number.isInteger(p)) {
                    const syncroState = this.syncroStates[p];
                    if (!syncroState) {
                        return undefined;
                    }
                    return syncroState.value;
                }
                else if (typeof p === 'string') {
                    if (p in this.methods) {
                        return this.methods[p];
                    }
                    if (p[0] === '$') {
                        return Reflect.get(target, p);
                    }
                    if (p === 'toJSON') {
                        return this.toJSON();
                    }
                    if (p === 'length') {
                        return this.array.length;
                    }
                }
                else if (p === Symbol.toStringTag) {
                    return 'Array';
                }
                else if (p === Symbol.iterator) {
                    const values = this.array.slice();
                    return Reflect.get(values, p);
                }
                return Reflect.get(target, p, receiver);
            },
            set: (target, pArg, value) => {
                const p = propertyToNumber(pArg);
                if (Number.isInteger(p)) {
                    if (value === undefined) {
                        return this.deleteProperty(target, p);
                    }
                    const syncroState = this.syncroStates[p];
                    if (!syncroState) {
                        this.state.transaction(() => {
                            this.syncroStates[p] = createSyncroState({
                                key: p,
                                validator: shape,
                                parent: this,
                                value,
                                state: this.state
                            });
                        });
                    }
                    else {
                        syncroState.value = value;
                    }
                }
                return true;
            },
            deleteProperty: this.deleteProperty,
            has: (target, pArg) => {
                const p = propertyToNumber(pArg);
                if (typeof p !== 'number') {
                    // forward to arrayimplementation
                    return Reflect.has(target, p);
                }
                if (p < this.array.lengthUntracked && p >= 0) {
                    return true;
                }
                else {
                    return false;
                }
            },
            getOwnPropertyDescriptor: (target, pArg) => {
                const p = propertyToNumber(pArg);
                if (p === 'length') {
                    return {
                        enumerable: false,
                        configurable: false,
                        writable: true
                    };
                }
                if (typeof p === 'number' && p >= 0 && p < this.yType.length) {
                    return {
                        enumerable: true,
                        configurable: true,
                        writable: true
                    };
                }
                return undefined;
            },
            ownKeys: (target) => {
                const keys = [];
                for (let i = 0; i < this.yType.length; i++) {
                    keys.push(i + '');
                }
                keys.push('length');
                return keys;
            }
        });
        this.sync(value);
    }
    toJSON = () => {
        return this.array;
    };
    setNull = () => {
        this.isNull = true;
        this.yType.delete(0, this.yType.length);
        this.yType.insert(0, [new Y.Text(NULL_ARRAY)]);
    };
    sync = (value) => {
        this.state.transaction(() => {
            this.syncroStates = [];
            if (this.yType.length === 1 &&
                this.yType.get(0) instanceof Y.Text &&
                this.yType.get(0).toString() === NULL_ARRAY) {
                // If the array is null, set the isNull state to true and return early
                this.isNull = true;
                return;
            }
            if (this.state.initialized || value) {
                for (let i = 0; i < Math.max(value?.length || 0, this.yType.length); i++) {
                    this.syncroStates[i] = createSyncroState({
                        key: i,
                        validator: this.validator.$schema.shape,
                        parent: this,
                        value: value?.[i] || this.validator.$schema.default?.[i],
                        state: this.state
                    });
                }
            }
            else {
                if (this.validator.$schema.default) {
                    this.syncroStates = this.validator.$schema.default.map((item, index) => {
                        return createSyncroState({
                            key: index,
                            validator: this.validator.$schema.shape,
                            parent: this,
                            value: item,
                            state: this.state
                        });
                    });
                }
                else if (this.validator.$schema.nullable && !value) {
                    this.setNull();
                }
            }
        });
    };
    observe = (e, _transaction) => {
        if (_transaction.origin !== this.state.transactionKey) {
            let start = 0;
            e.delta.forEach(({ retain, delete: _delete, insert }) => {
                if (retain) {
                    start += retain;
                }
                if (_delete) {
                    const deleted = this.syncroStates.splice(start, _delete);
                    deleted.forEach((state) => {
                        state.destroy();
                    });
                    start -= _delete;
                }
                if (Array.isArray(insert)) {
                    for (let i = 0; i < insert.length; i++) {
                        if (insert[i] instanceof Y.Text && insert[i].toString() === NULL_ARRAY) {
                            this.isNull = true;
                            return;
                        }
                        this.syncroStates.splice(start, 0, createSyncroState({
                            key: start,
                            validator: this.validator.$schema.shape,
                            parent: this,
                            state: this.state
                        }));
                        start += 1;
                    }
                }
            });
        }
    };
    methods = {
        slice: (start, end) => {
            return this.array.slice(start, end);
        },
        toReversed: () => {
            return this.array.toReversed();
        },
        forEach: (cb) => {
            return this.array.forEach(cb);
        },
        every: (cb) => {
            return this.array.every(cb);
        },
        filter: (cb) => {
            return this.array.filter(cb);
        },
        find: (cb) => {
            return this.array.find(cb);
        },
        findIndex: (cb) => {
            return this.array.findIndex(cb);
        },
        some: (cb) => {
            return this.array.some(cb);
        },
        includes: (value) => {
            return this.array.includes(value);
        },
        map: (cb) => {
            return this.array.map(cb);
        },
        reduce: (cb, initialValue) => {
            return this.array.reduce(cb, initialValue);
        },
        indexOf: (value) => {
            return this.array.indexOf(value);
        },
        at: (index) => {
            return this.array.at(index)?.value;
        },
        //
        // Mutatives methods
        //
        pop: () => {
            if (!this.syncroStates.length) {
                return undefined;
            }
            const last = this.syncroStates.pop();
            this.state.transaction(() => {
                this.yType.delete(this.yType.length - 1, 1);
                last?.destroy();
            });
            return last?.value;
        },
        shift: () => {
            if (!this.syncroStates.length) {
                return undefined;
            }
            const first = this.syncroStates.shift();
            this.state.transaction(() => {
                this.yType.delete(0, 1);
                first?.destroy();
            });
            return first?.value;
        },
        unshift: (...items) => {
            let result;
            this.state.transaction(() => {
                result = this.syncroStates.unshift(...items.map((item, index) => {
                    return createSyncroState({
                        forceNewType: true,
                        key: index,
                        validator: this.validator.$schema.shape,
                        parent: this,
                        value: item,
                        state: this.state
                    });
                }));
            });
            return result;
        },
        push: (...items) => {
            this.state.transaction(() => {
                this.syncroStates.push(...items.map((item, index) => {
                    return createSyncroState({
                        key: this.yType.length,
                        validator: this.validator.$schema.shape,
                        parent: this,
                        value: item,
                        state: this.state
                    });
                }));
            });
        },
        splice: (start, deleteCount, ..._items) => {
            let result = [];
            this.state.transaction(() => {
                const newSyncroStates = _items.map((item, index) => {
                    this.yType.delete(start, deleteCount);
                    return createSyncroState({
                        key: start + index,
                        forceNewType: true,
                        validator: this.validator.$schema.shape,
                        parent: this,
                        value: item,
                        state: this.state
                    });
                });
                if (deleteCount) {
                    for (let i = 0; i < deleteCount; i++) {
                        const state = this.syncroStates[start + i];
                        if (state) {
                            state.destroy();
                        }
                    }
                }
                result = this.syncroStates.splice(start, deleteCount, ...newSyncroStates);
            });
            return result;
        }
    };
    destroy = () => {
        this.syncroStates.forEach((state) => {
            state.destroy();
        });
        this.syncroStates = [];
        this.yType.unobserve(this.observe);
    };
}
