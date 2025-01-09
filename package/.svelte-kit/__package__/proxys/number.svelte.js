import * as Y from 'yjs';
import { BaseSyncedType } from './base.svelte.js';
import { logError } from '../utils.js';
export class SyncedNumber extends BaseSyncedType {
    validator;
    get value() {
        return this.validator.coerce(this.rawValue);
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
        this.validator = opts.validator;
    }
}
