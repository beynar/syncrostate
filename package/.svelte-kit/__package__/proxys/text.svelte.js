import * as Y from 'yjs';
import { BaseSyncedType } from './base.svelte.js';
import { NULL } from '../constants.js';
import { logError } from '../utils.js';
export class SyncedText extends BaseSyncedType {
    validator;
    get value() {
        return this.rawValue === NULL ? null : this.rawValue;
    }
    set value(value) {
        const isValid = this.validator.isValid(value);
        if (!isValid) {
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
        this.validator = opts.validator;
    }
}
