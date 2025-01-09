import { NULL } from '../constants.js';
import { BaseValidator } from './base.js';
export class EnumValidator extends BaseValidator {
    constructor(...values) {
        super({ kind: 'enum', optional: false, nullable: false, values: new Set(values) });
    }
    get defaultValue() {
        return this.$schema.default || null;
    }
    isValid = (value) => {
        if (this.$schema.values.has(value)) {
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
        if (this.$schema.values.has(value))
            return value;
        return this.$schema.nullable ? null : this.defaultValue;
    }
    stringify = (value) => {
        if (value === null)
            return NULL;
        return this.coerce(value)?.toString() ?? '';
    };
}
