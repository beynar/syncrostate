import * as Y from 'yjs';
import { BaseSyncedType } from './base.svelte.js';
import { NULL } from '../constants.js';
export class SyncedText extends BaseSyncedType {
    validator;
    get value() {
        return this.rawValue === NULL ? null : this.rawValue;
    }
    set value(value) {
        console.log(this.validator.isValid(value));
        if (!this.validator.isValid(value)) {
            console.error('Invalid value', { value });
            return;
        }
        this.setYValue(value);
    }
    constructor(yType, validator) {
        super(yType);
        this.validator = validator;
    }
}
