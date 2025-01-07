import { NULL } from '../constants.js';
import { BaseValidator } from './base.js';
export class DateValidator extends BaseValidator {
    constructor() {
        super({ kind: 'date', optional: false, nullable: false });
    }
    min(date) {
        this.$schema.min = date;
        return this;
    }
    max(date) {
        this.$schema.max = date;
        return this;
    }
    isStringADate(value) {
        try {
            return !isNaN(new Date(value).getTime());
        }
        catch (error) {
            return false;
        }
    }
    isValid = (value) => {
        if (!this.isValidNullOrUndefined(value)) {
            return false;
        }
        if (typeof value === 'string' && !this.isStringADate(value)) {
            return false;
        }
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
        if (value === NULL || value === null)
            return null;
        if (this.isStringADate(value)) {
            return new Date(value);
        }
        if (Number.isInteger(Number(value)) &&
            !isNaN(Number(value)) &&
            !isNaN(new Date(Number(value)).getTime())) {
            return new Date(Number(value));
        }
        return null;
    }
    stringify = (value) => {
        return this.coerce(value)?.toISOString() ?? '';
    };
}
