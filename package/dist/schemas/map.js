import { isValidNullOrUndefined } from './base.js';
export class MapValidator {
    $schema;
    constructor(shape) {
        this.$schema = {
            kind: 'map',
            optional: false,
            nullable: false,
            shape
        };
    }
    isValidNullOrUndefined = isValidNullOrUndefined.bind(this);
    isValid = (value) => {
        if (value instanceof Map) {
            return Array.from(value.values()).every((val) => {
                return this.$schema.shape.isValid(val);
            });
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
    default(value) {
        if (value instanceof Map) {
            this.$schema.default = value;
        }
        else {
            this.$schema.default = new Map(Object.entries(value));
        }
        return this;
    }
    coerce(value) {
        if (value instanceof Map) {
            const entries = Array.from(value.entries()).filter(([key, value]) => this.$schema.shape.isValid(value));
            if (entries.length > 0) {
                return new Map(entries);
            }
        }
        if (value === null && this.$schema.nullable) {
            return null;
        }
        return this.$schema.default || new Set();
    }
    parse(value) {
        return {
            isValid: this.isValid(value),
            value: this.coerce(value)
        };
    }
}
