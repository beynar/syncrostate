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
    get defaultValue() {
        return this.$schema.default || null;
    }
    isValid = (value) => {
        if (value instanceof Date) {
            if (this.$schema.min && value < this.$schema.min) {
                return false;
            }
            if (this.$schema.max && value > this.$schema.max) {
                return false;
            }
            return true;
        }
        if (value === NULL || value === null) {
            return this.$schema.nullable;
        }
        if (value === undefined) {
            return this.$schema.optional;
        }
        return false;
    };
    parse(value) {
        const coerced = this.coerce(value);
        return {
            isValid: this.isValid(coerced),
            value: coerced
        };
    }
    coerce(value) {
        if (value === NULL || value === null || value === undefined) {
            if (this.$schema.nullable) {
                return null;
            }
            else {
                return this.defaultValue;
            }
        }
        if (value === undefined) {
            return this.$schema.optional ? null : this.defaultValue;
        }
        if (this.isStringADate(value)) {
            return new Date(value);
        }
        return this.$schema.nullable ? null : this.defaultValue;
    }
    stringify = (value) => {
        if (value instanceof Date) {
            return value.toISOString();
        }
        else {
            if (this.$schema.nullable) {
                return NULL;
            }
            else {
                return this.defaultValue?.toISOString() || NULL;
            }
        }
    };
}
