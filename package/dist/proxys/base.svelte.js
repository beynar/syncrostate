import * as Y from 'yjs';
import { NULL } from '../constants.js';
export const getInitialStringifiedValue = (value, validator) => {
    if (validator.$schema.kind === 'array' || validator.$schema.kind === 'object') {
        return undefined;
    }
    const DEFAULT_VALUE = value === null ? null : (value ?? validator.$schema.default);
    const isValid = validator.isValid(DEFAULT_VALUE);
    if (!isValid) {
        return undefined;
    }
    if (DEFAULT_VALUE !== undefined) {
        const stringifiedDefaultValue = validator.stringify(DEFAULT_VALUE);
        return stringifiedDefaultValue;
    }
};
export class BaseSyncedType {
    INTERNAL_ID;
    yType;
    rawValue = $state('');
    observeCallback;
    constructor(yType) {
        this.INTERNAL_ID = crypto.randomUUID();
        this.yType = yType;
        this.rawValue = yType.toString();
        this.yType.observe(this.observe);
    }
    observe = (e, transact) => {
        if (transact.origin !== this.INTERNAL_ID) {
            this.rawValue = this.yType.toString();
            this.observeCallback?.(e, transact);
        }
    };
    destroy = () => {
        this.yType.unobserve(this.observe);
    };
    setYValue(value) {
        if (this.rawValue !== value) {
            const length = this.yType.length;
            this.rawValue = value;
            this.yType.doc?.transact(() => {
                this.yType.applyDelta(length ? [{ delete: length }, { insert: value ?? NULL }] : [{ insert: value ?? NULL }]);
            }, this.INTERNAL_ID);
        }
    }
    [Symbol.dispose]() {
        this.destroy();
    }
}
