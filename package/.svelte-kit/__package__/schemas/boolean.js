import { NULL } from '../constants.js';
import { BaseValidator } from './base.js';
export class BooleanValidator extends BaseValidator {
    constructor() {
        super({ kind: 'boolean', optional: false, nullable: false });
    }
    get defaultValue() {
        return this.$schema.default || null;
    }
    isValid = (value) => {
        if (typeof value === 'boolean') {
            return true;
        }
        if (value === null) {
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
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return this.$schema.nullable ? null : this.defaultValue;
    }
    stringify = (value) => {
        if (typeof value === 'boolean') {
            return value ? 'true' : 'false';
        }
        else {
            if (this.$schema.nullable) {
                return NULL;
            }
            else {
                return this.defaultValue === null ? NULL : this.defaultValue ? 'true' : 'false';
            }
        }
    };
}
