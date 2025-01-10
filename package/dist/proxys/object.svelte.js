import * as Y from 'yjs';
import { isMissingOptionnal } from '../utils.js';
import { createSyncroState } from './syncroState.svelte.js';
import { logError } from '../utils.js';
import { NULL_OBJECT } from '../constants.js';
const createYTypesObjectProxy = (yType) => {
    return new Proxy({}, {
        get: (target, key) => {
            if (typeof key === 'string' && yType.has(key)) {
                return yType.get(key);
            }
            return undefined;
        }
    });
};
export class SyncedObject {
    state;
    validator;
    yType;
    syncroStates = $state({});
    baseImplementation = {};
    proxy;
    parent;
    key;
    isNull = $state(false);
    deleteProperty = (target, p) => {
        if (typeof p !== 'string') {
            return true;
        }
        const syncroState = this.syncroStates[p];
        if (!syncroState) {
            logError('Property does not exist', p);
            return true;
        }
        else if (!syncroState.validator.$schema.optional) {
            logError('Can not delete non optional property', p);
            return true;
        }
        this.yType.delete(p);
        syncroState.destroy();
        delete this.syncroStates[p];
        return true;
    };
    setNull() {
        this.isNull = true;
        this.yType.set(NULL_OBJECT, new Y.Text(NULL_OBJECT));
    }
    set value(input) {
        const { isValid, value } = this.validator.parse(input);
        if (!isValid) {
            logError('Invalid value', { value });
            return;
        }
        const shape = this.validator.$schema.shape;
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
                    this.yType.delete(NULL_OBJECT);
                }
                const remainingStates = Object.keys(this.syncroStates).filter((key) => !(key in value));
                remainingStates.forEach((key) => {
                    this.syncroStates[key].destroy();
                    delete this.syncroStates[key];
                    this.yType.delete(key);
                });
                Object.entries(value).forEach(([key, value]) => {
                    if (key in shape) {
                        const syncroState = this.syncroStates[key];
                        if (syncroState) {
                            syncroState.value = value;
                        }
                        else {
                            this.syncroStates[key] = createSyncroState({
                                key,
                                validator: shape[key],
                                parent: this,
                                state: this.state,
                                value
                            });
                        }
                    }
                });
            }
        });
    }
    get value() {
        if (this.isNull) {
            return null;
        }
        return this.proxy;
    }
    constructor({ state, observe = true, validator, yType, baseImplementation = {}, value, parent, key }) {
        this.parent = parent;
        this.state = state;
        this.key = key;
        this.validator = validator;
        this.yType = yType;
        this.baseImplementation = baseImplementation;
        const shape = this.validator.$schema.shape;
        this.proxy = new Proxy({}, {
            get: (target, key) => {
                if (key === 'getState') {
                    return () => state;
                }
                if (key === 'getType') {
                    return () => yType;
                }
                if (key === 'getTypes') {
                    return () => createYTypesObjectProxy(yType);
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
                    this.state.transaction(() => {
                        this.syncroStates[key] = createSyncroState({
                            key,
                            validator: shape[key],
                            parent: this,
                            state: this.state,
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
            this.sync(value);
        }
    }
    observe = (e, _transaction) => {
        if (_transaction.origin !== this.state.transactionKey) {
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
                        state: this.state,
                        parent: this
                    });
                    Object.assign(this.syncroStates, { [key]: syncroState });
                }
            });
            if (this.yType.has(NULL_OBJECT)) {
                this.isNull = true;
                return;
            }
        }
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
        this.state.transaction(() => {
            this.syncroStates = {};
            if (this.yType.has(NULL_OBJECT)) {
                this.isNull = true;
                return;
            }
            const hasDefaultValue = this.validator.$schema.default;
            if (!hasDefaultValue) {
                if (this.validator.$schema.nullable && !value) {
                    this.setNull();
                    return;
                }
            }
            Object.entries(this.validator.$schema.shape).forEach(([key, validator]) => {
                if (isMissingOptionnal({ validator, parent: this.yType, key })) {
                    return;
                }
                this.syncroStates[key] = createSyncroState({
                    key,
                    validator: validator,
                    parent: this,
                    value: value?.[key] || this.validator.$schema.default?.[key],
                    state: this.state
                });
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
