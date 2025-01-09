import { isValidNullOrUndefined } from './base.js';
export class ArrayValidator {
    $schema;
    constructor(shape) {
        this.$schema = {
            kind: 'array',
            optional: false,
            nullable: false,
            shape
        };
    }
    isValidNullOrUndefined = isValidNullOrUndefined.bind(this);
    get defaultValue() {
        return this.$schema.default || null;
    }
    isValid = (value) => {
        if (Array.isArray(value)) {
            return value.every((item) => this.$schema.shape.isValid(item));
        }
        if (value === null) {
            return this.$schema.nullable;
        }
        if (value === undefined) {
            return this.$schema.optional;
        }
        return false;
    };
    optional() {
        this.$schema.optional = true;
        return this;
    }
    nullable() {
        this.$schema.nullable = true;
        return this;
    }
    coerce(value) {
        const isArray = Array.isArray(value);
        const validItems = isArray ? value.filter((item) => this.$schema.shape.isValid(item)) : [];
        const someValid = validItems.length > 0;
        if (isArray && someValid) {
            return validItems.map((item) => this.$schema.shape.coerce(item));
        }
        if (value === null && this.$schema.nullable) {
            return null;
        }
        return this.defaultValue;
    }
    parse(value) {
        const coerced = this.coerce(value);
        return {
            isValid: this.isValid(value),
            value: coerced
        };
    }
    default(value) {
        this.$schema.default = value;
        return this;
    }
}
