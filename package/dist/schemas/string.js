import { NULL } from '../constants.js';
import { BaseValidator } from './base.js';
export class StringValidator extends BaseValidator {
    constructor() {
        super({ kind: 'string', optional: false, nullable: false });
    }
    isValid = (value) => {
        if (!this.isValidNullOrUndefined(value)) {
            return false;
        }
        if (typeof value !== 'string')
            return false;
        if (this.$schema.min && value.length < this.$schema.min)
            return false;
        if (this.$schema.max && value.length > this.$schema.max)
            return false;
        if (this.$schema.pattern && !this.$schema.pattern.test(value))
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
    min(length) {
        this.$schema.min = length;
        return this;
    }
    max(length) {
        this.$schema.max = length;
        return this;
    }
    pattern(regex) {
        this.$schema.pattern = regex;
        return this;
    }
    coerce(value) {
        if (value === NULL)
            return null;
        return value;
    }
    stringify = (value) => {
        if (value === null)
            return NULL;
        return this.coerce(value)?.toString() ?? '';
    };
}
