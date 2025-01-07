import * as Y from 'yjs';
import { createSyncroState } from './syncroState.svelte.js';
function propertyToNumber(p) {
    if (typeof p === 'string' && p.trim().length) {
        const asNum = Number(p);
        // https://stackoverflow.com/questions/10834796/validate-that-a-string-is-a-positive-integer
        if (Number.isInteger(asNum)) {
            return asNum;
        }
    }
    return p;
}
export class SyncedArray {
    INTERNAL_ID = crypto.randomUUID();
    validator;
    yType;
    syncroStates = $state([]);
    proxy;
    get array() {
        return this.syncroStates.map((state) => state.value);
    }
    deleteProperty = (target, pArg) => {
        const p = propertyToNumber(pArg);
        if (typeof p !== 'number') {
            return true;
        }
        if (!this.validator.$schema.shape.$schema.optional) {
            console.error('Can not delete non optional property', p);
            return true;
        }
        const syncroState = this.syncroStates[p];
        if (!syncroState) {
            console.error('Index does not exist', p);
            return true;
        }
        syncroState.value = undefined;
        return true;
    };
    set value(value) {
        if (!this.validator.isValid(value)) {
            console.error('Invalid value', { value });
            return;
        }
        this.transact(() => {
            const remainingStates = this.syncroStates.slice(value.length);
            remainingStates.forEach((state) => {
                state.destroy();
            });
            if (remainingStates.length) {
                this.yType.delete(value.length, remainingStates.length);
            }
            this.syncroStates = value.map((item, index) => {
                const previsousState = this.syncroStates[index];
                if (previsousState) {
                    previsousState.value = item;
                    return previsousState;
                }
                else {
                    return createSyncroState({
                        key: index,
                        forceNewType: true,
                        validator: this.validator.$schema.shape,
                        parent: this.yType,
                        value: item
                    });
                }
            });
        });
    }
    get value() {
        this.syncroStates;
        return this.proxy;
    }
    constructor({ validator, yType, value }) {
        this.validator = validator;
        this.yType = yType;
        yType.observe(this.observe);
        const shape = this.validator.$schema.shape;
        this.proxy = new Proxy([], {
            get: (target, pArg, receiver) => {
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
            deleteProperty: this.deleteProperty,
            set: (target, pArg, value) => {
                const p = propertyToNumber(pArg);
                if (Number.isInteger(p)) {
                    if (value === undefined) {
                        return this.deleteProperty(target, p);
                    }
                    const syncroState = this.syncroStates[p];
                    if (!syncroState) {
                        this.transact(() => {
                            this.syncroStates[p] = createSyncroState({
                                key: p,
                                validator: shape,
                                parent: this.yType,
                                value
                            });
                        });
                    }
                    else {
                        syncroState.value = value;
                    }
                }
                return true;
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
        this.sync(value || this.validator.$schema.default || []);
    }
    transact = (fn) => {
        this.yType.doc?.transact(() => {
            fn();
        }, this.INTERNAL_ID);
    };
    toJSON = () => {
        return this.array;
    };
    sync = (value) => {
        this.syncroStates = [];
        this.yType.forEach((item, index) => {
            this.syncroStates[index] = createSyncroState({
                key: index,
                validator: this.validator.$schema.shape,
                parent: this.yType,
                value: value?.[index]
            });
        });
    };
    observe = (e, _transaction) => {
        if (_transaction.origin === this.INTERNAL_ID) {
            console.log('same origin');
            return;
        }
        let start = 0;
        e.delta.forEach(({ retain, delete: _delete, insert }) => {
            // console.log({ retain, delete: _delete, insert });
            if (retain) {
                start += retain;
            }
            if (_delete) {
                const deleted = this.syncroStates.splice(start, _delete);
                deleted.forEach((state) => {
                    state.destroy();
                });
                console.log({ deleted, start, _delete });
                start -= _delete;
            }
            if (Array.isArray(insert)) {
                for (let i = 0; i < insert.length; i++) {
                    this.syncroStates.splice(start, 0, createSyncroState({
                        key: start,
                        validator: this.validator.$schema.shape,
                        parent: this.yType
                    }));
                    start += i + 1;
                }
            }
        });
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
            this.transact(() => {
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
            this.transact(() => {
                this.yType.delete(0, 1);
                first?.destroy();
            });
            return first?.value;
        },
        unshift: (...items) => {
            let result;
            this.transact(() => {
                result = this.syncroStates.unshift(...items.map((item, index) => {
                    return createSyncroState({
                        forceNewType: true,
                        key: index,
                        validator: this.validator.$schema.shape,
                        parent: this.yType,
                        value: item
                    });
                }));
            });
            return result;
        },
        push: (...items) => {
            this.transact(() => {
                this.syncroStates.push(...items.map((item, index) => {
                    return createSyncroState({
                        key: this.yType.length,
                        validator: this.validator.$schema.shape,
                        parent: this.yType,
                        value: item
                    });
                }));
            });
        },
        splice: (start, deleteCount, ..._items) => {
            let result = [];
            this.transact(() => {
                const newSyncroStates = _items.map((item, index) => {
                    console.log(start + index, item);
                    this.yType.delete(start, deleteCount);
                    return createSyncroState({
                        key: start + index,
                        forceNewType: true,
                        validator: this.validator.$schema.shape,
                        parent: this.yType,
                        value: item
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
