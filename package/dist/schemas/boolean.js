import { NULL } from '../constants.js';
import { BaseValidator } from './base.js';
export class BooleanValidator extends BaseValidator {
    constructor() {
        super({ kind: 'boolean', optional: false, nullable: false });
    }
    isValid = (value) => {
        if (!this.isValidNullOrUndefined(value)) {
            return false;
        }
        if (typeof value !== 'boolean')
            return false;
        return true;
    };
    parse(value) {
        const coerced = this.coerce(value);
        return {
            isValid: this.isValid(coerced),
            value: coerced
        };
    }
    coerce(value) {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        if (value === NULL || value === null)
            return null;
        if (Number(value) === 1)
            return true;
        if (Number(value) === 0)
            return false;
        return null;
    }
    stringify = (value) => {
        if (value === null)
            return NULL;
        const coercedValue = this.coerce(value);
        return coercedValue ? String(coercedValue) : '';
    };
}
