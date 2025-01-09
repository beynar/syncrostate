import * as Y from 'yjs';
import { INITIALIZED, NULL } from './constants.js';
import { DEV } from 'esm-env';
export const isMissingOptionnal = ({ parent, key, validator }) => {
    const exists = parent instanceof Y.Map ? parent.has(String(key)) : !!parent.get(Number(key));
    const isMissingOptionnal = validator.$schema.optional && !exists;
    const hasDefault = validator.$schema.default !== undefined;
    return isMissingOptionnal && !hasDefault;
};
export const getInitialStringifiedValue = (value, validator) => {
    if (validator.$schema.kind === 'array' || validator.$schema.kind === 'object') {
        return undefined;
    }
    const DEFAULT_VALUE = value === null ? null : (value ?? validator.$schema.default);
    const isValid = validator.isValid(DEFAULT_VALUE);
    if (!isValid) {
        if (validator.$schema.nullable) {
            return NULL;
        }
        return undefined;
    }
    if (DEFAULT_VALUE !== undefined) {
        const stringifiedDefaultValue = validator.stringify(DEFAULT_VALUE);
        return stringifiedDefaultValue;
    }
};
export const getTypeFromParent = ({ parent, key, validator, forceNewType, value }) => {
    const isArray = parent instanceof Y.Array;
    const instance = getInstance(validator);
    const isText = instance === Y.Text;
    const stringifiedValue = getInitialStringifiedValue(value, validator);
    const type = isText ? new Y.Text(stringifiedValue) : new instance();
    const typeInParent = (isArray ? parent.get(Number(key)) : parent.get(String(key)));
    const setAndReturnType = () => {
        if (isArray) {
            parent.insert(Number(key), [type]);
        }
        else {
            parent.delete(String(key));
            parent.set(String(key), type);
        }
        return type;
    };
    if (!typeInParent || typeInParent._item?.deleted || forceNewType) {
        return setAndReturnType();
    }
    if (!(typeInParent instanceof instance)) {
        return setAndReturnType();
    }
    else {
        return typeInParent;
    }
};
export const getInstance = (validator) => {
    switch (validator.$schema.kind) {
        case 'object':
            return Y.Map;
        case 'array':
            return Y.Array;
        default:
            return Y.Text;
    }
};
export const logError = (...args) => {
    if (DEV) {
        console.error(...args);
    }
};
export const isInitialized = ({ yType }) => {
    // @ts-ignore
    return yType.doc?.initialized;
};
// From https://github.com/YousefED/SyncedStore/blob/main/packages/core/src/array.ts
export const propertyToNumber = (p) => {
    if (typeof p === 'string' && p.trim().length) {
        const asNum = Number(p);
        if (Number.isInteger(asNum)) {
            return asNum;
        }
    }
    return p;
};
