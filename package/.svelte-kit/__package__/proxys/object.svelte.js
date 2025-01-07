import * as Y from 'yjs';
import { isMissingOptionnal } from '../utils.js';
import { createSyncroState } from './syncroState.svelte.js';
export class SyncedObject {
    INTERNAL_ID;
    validator;
    yType;
    syncroStates = $state({});
    baseImplementation = {};
    proxy;
    deleteProperty = (target, p) => {
        if (typeof p !== 'string') {
            return true;
        }
        const syncroState = this.syncroStates[p];
        if (!syncroState) {
            console.error('Property does not exist', p);
            return true;
        }
        else if (!syncroState.validator.$schema.optional) {
            console.error('Can not delete non optional property', p);
            return true;
        }
        this.yType.delete(p);
        syncroState.destroy();
        delete this.syncroStates[p];
        return true;
    };
    transact = (fn) => {
        this.yType.doc?.transact(fn, this.INTERNAL_ID);
    };
    set value(value) {
        if (!this.validator.isValid(value)) {
            console.error('Invalid value', { value });
            return;
        }
        const shape = this.validator.$schema.shape;
        this.transact(() => {
            const remainingStates = Object.keys(this.syncroStates).filter((key) => !(key in value));
            remainingStates.forEach((key) => {
                this.syncroStates[key].destroy();
                delete this.syncroStates[key];
            });
            Object.entries(value).forEach(([key, value]) => {
                if (key in shape) {
                    if (this.syncroStates[key]) {
                        this.syncroStates[key].value = value;
                    }
                    else {
                        this.syncroStates[key] = createSyncroState({
                            key,
                            validator: shape[key],
                            parent: this.yType,
                            value
                        });
                    }
                }
            });
        });
    }
    get value() {
        return this.proxy;
    }
    constructor({ observe = true, validator, yType, baseImplementation = {}, value }) {
        this.INTERNAL_ID = crypto.randomUUID();
        this.validator = validator;
        this.yType = yType;
        this.baseImplementation = baseImplementation;
        const shape = this.validator.$schema.shape;
        this.proxy = new Proxy(this.baseImplementation, {
            get: (target, key) => {
                if (key[0] === '$') {
                    return Reflect.get(target, key);
                }
                if (key === 'toJSON') {
                    return this.toJSON();
                }
                const syncroState = this.syncroStates[key];
                if (!syncroState) {
                    return undefined;
                }
                return syncroState.value;
            },
            set: (target, key, value) => {
                if (!(key in this.validator.$schema.shape)) {
                    return false;
                }
                if (value === undefined) {
                    return this.deleteProperty(target, key);
                }
                const syncroState = this.syncroStates[key];
                if (!syncroState) {
                    this.transact(() => {
                        this.syncroStates[key] = createSyncroState({
                            key,
                            validator: shape[key],
                            parent: this.yType,
                            value
                        });
                    });
                }
                else {
                    syncroState.value = value;
                }
                return true;
            },
            deleteProperty: this.deleteProperty,
            has: (target, key) => {
                if (typeof key !== 'string') {
                    return false;
                }
                return this.yType.has(key);
            },
            getOwnPropertyDescriptor(target, key) {
                if ((typeof key === 'string' && yType.has(key)) || key === 'toJSON') {
                    return {
                        enumerable: true,
                        configurable: true
                    };
                }
                return undefined;
            },
            ownKeys: () => Array.from(this.yType.keys())
        });
        if (observe) {
            yType.observe(this.observe);
            this.sync(value || this.validator.$schema.default);
        }
    }
    observe = (e, _transaction) => {
        if (_transaction.origin === this.INTERNAL_ID) {
            return;
        }
        e.changes?.keys.forEach(({ action }, key) => {
            const syncedType = this.syncroStates[key];
            if (action === 'delete' && syncedType) {
                syncedType.destroy();
                delete this.syncroStates[key];
            }
            if (action === 'add') {
                // If a new key is added to the object and is valid, integrate it
                const syncroState = createSyncroState({
                    key,
                    validator: this.validator.$schema.shape[key],
                    parent: this.yType
                });
                Object.assign(this.syncroStates, { [key]: syncroState });
            }
        });
    };
    toJSON = () => {
        return Object.entries(this.validator.$schema.shape).reduce((acc, [key, validator]) => {
            const value = this.syncroStates[key]?.value;
            if (value !== undefined) {
                Object.assign(acc, { [key]: value });
            }
            return acc;
        }, {});
    };
    sync = (value) => {
        this.syncroStates = {};
        Object.entries(this.validator.$schema.shape).forEach(([key, validator]) => {
            if (isMissingOptionnal({ validator, parent: this.yType, key })) {
                return;
            }
            this.syncroStates[key] = createSyncroState({
                key,
                validator: validator,
                parent: this.yType,
                value: value?.[key]
            });
        });
    };
    destroy = () => {
        this.yType.unobserve(this.observe);
        Object.values(this.syncroStates).forEach((syncroState) => {
            syncroState.destroy();
        });
        this.syncroStates = {};
    };
}
