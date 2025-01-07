import { NULL } from '../constants.js';
import { BaseValidator } from './base.js';
export class EnumValidator extends BaseValidator {
    constructor(...values) {
        super({ kind: 'enum', optional: false, nullable: false, values: new Set(values) });
    }
    isValid = (value) => {
        if (!this.isValidNullOrUndefined(value)) {
            return false;
        }
        return this.$schema.values.has(value);
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
        if (this.$schema.values.has(value))
            return value;
        return null;
    }
    stringify = (value) => {
        if (value === null)
            return NULL;
        return this.coerce(value)?.toString() ?? '';
    };
}
