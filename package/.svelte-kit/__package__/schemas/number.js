import { NULL } from '../constants.js';
import { BaseValidator } from './base.js';
export class NumberValidator extends BaseValidator {
    constructor() {
        super({ kind: 'number', optional: false, nullable: false });
    }
    isValid = (value) => {
        if (!this.isValidNullOrUndefined(value)) {
            return false;
        }
        return typeof value === 'number' && !isNaN(Number(value));
    };
    parse(value) {
        const coerced = this.coerce(value);
        return {
            isValid: this.isValid(coerced),
            value: coerced
        };
    }
    coerce(value) {
        if (value === NULL || value === null)
            return null;
        const parsed = Number(value);
        return parsed;
    }
    stringify = (value) => {
        if (value === null)
            return NULL;
        return this.coerce(value) ? String(value) : '';
    };
}
