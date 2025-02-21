import { BaseValidator } from './base.js';
export class SetValidator {
    $schema;
    constructor(shape) {
        this.$schema = {
            kind: 'set',
            optional: false,
            nullable: false,
            shape
        };
    }
    optional() {
        this.$schema.optional = true;
        return this;
    }
    nullable() {
        this.$schema.nullable = true;
        return this;
    }
    default(value) {
        if (value instanceof Set) {
            this.$schema.default = value;
        }
        else {
            this.$schema.default = new Set(value);
        }
        return this;
    }
    isValid = (value) => {
        if (value instanceof Set) {
            return Array.from(value).every((item) => this.$schema.shape.isValid(item));
        }
        if (value === null) {
            return this.$schema.nullable;
        }
        if (value === undefined) {
            return this.$schema.optional;
        }
        return false;
    };
    coerce(value) {
        if (value instanceof Set) {
            const validItems = Array.from(value).filter((item) => this.$schema.shape.isValid(item));
            if (validItems.length > 0) {
                return new Set(validItems);
            }
        }
        if (value === null && this.$schema.nullable) {
            return null;
        }
        return this.$schema.default || new Set();
    }
    parse(value) {
        const coerced = this.coerce(value);
        return {
            isValid: this.isValid(value),
            value: coerced
        };
    }
}
