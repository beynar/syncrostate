import { NULL } from '../constants.js';
import { BaseValidator } from './base.js';
export class StringValidator extends BaseValidator {
    constructor() {
        super({ kind: 'string', optional: false, nullable: false });
    }
    get defaultValue() {
        return this.$schema.default || null;
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
    isValid = (value) => {
        if (typeof value === 'string') {
            if (this.$schema.min && value.length < this.$schema.min)
                return false;
            if (this.$schema.max && value.length > this.$schema.max)
                return false;
            if (this.$schema.pattern && !this.$schema.pattern.test(value))
                return false;
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
        if (value === NULL || value === null) {
            if (this.$schema.nullable) {
                return null;
            }
            else {
                return this.defaultValue;
            }
        }
        if (value === undefined) {
            // TODO maybe we should return undefined instead of null
            return this.$schema.nullable ? null : this.defaultValue;
        }
        if (typeof value === 'string') {
            return value;
        }
        return this.$schema.nullable ? null : this.defaultValue;
    }
    stringify = (value) => {
        if (typeof value === 'string') {
            return value;
        }
        else {
            if (this.$schema.nullable) {
                return NULL;
            }
            else {
                return this.defaultValue || NULL;
            }
        }
    };
}
