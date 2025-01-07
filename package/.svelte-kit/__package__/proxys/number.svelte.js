import * as Y from 'yjs';
import { BaseSyncedType } from './base.svelte.js';
export class SyncedNumber extends BaseSyncedType {
    validator;
    get value() {
        return this.validator.coerce(this.rawValue);
    }
    set value(value) {
        if (!this.validator.isValid(value)) {
            console.error('Invalid value', { value });
            return;
        }
        this.setYValue(this.validator.stringify(value));
    }
    constructor(yType, validator) {
        super(yType);
        this.validator = validator;
    }
}
