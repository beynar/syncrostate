import { NULL } from '../constants.js';
import { BaseValidator } from './base.js';
export class NumberValidator extends BaseValidator {
    constructor() {
        super({ kind: 'number', optional: false, nullable: false });
    }
    get defaultValue() {
        return this.$schema.default || null;
    }
    isValid = (value) => {
        if (typeof value === 'number' && !isNaN(value)) {
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
            return this.$schema.optional ? null : this.defaultValue;
        }
        const parsed = Number(value);
        if (isNaN(parsed)) {
            return this.$schema.nullable ? null : this.defaultValue;
        }
        return parsed;
    }
    stringify = (value) => {
        if (typeof value === 'number') {
            return String(value);
        }
        else {
            if (this.$schema.nullable) {
                return NULL;
            }
            else {
                return this.defaultValue?.toString() || NULL;
            }
        }
    };
}
