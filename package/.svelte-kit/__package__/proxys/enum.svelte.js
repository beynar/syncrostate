import * as Y from 'yjs';
import { BaseSyncedType } from './base.svelte.js';
import { logError } from '../utils.js';
// 🚨🚨🚨 design decision: enum are defaulted to the first value of the set if not optionnal or nullable and the value does not exist in the document.
export class SyncedEnum extends BaseSyncedType {
    validator;
    firstValue;
    get value() {
        const value = this.validator.coerce(this.rawValue);
        if (!this.validator.$schema.nullable && value === null) {
            return this.validator.$schema.default || this.firstValue;
        }
        if (!this.validator.$schema.optional && value === undefined) {
            return this.validator.$schema.default || this.firstValue;
        }
        return value;
    }
    set value(value) {
        if (!this.validator.isValid(value)) {
            logError('Invalid value', { value });
            return;
        }
        if (value === undefined) {
            this.deletePropertyFromParent();
        }
        else {
            this.setYValue(this.validator.stringify(value));
        }
    }
    constructor(opts) {
        super(opts);
        this.firstValue = opts.validator.$schema.values.values().next().value;
        this.validator = opts.validator;
    }
}
