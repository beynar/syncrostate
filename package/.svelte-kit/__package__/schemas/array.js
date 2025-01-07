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
    isValid = (value) => {
        if (!Array.isArray(value))
            return false;
        if (!this.isValidNullOrUndefined(value)) {
            return false;
        }
        return value.every((item) => this.$schema.shape.isValid(item));
    };
    optional() {
        this.$schema.optional = true;
        return this;
    }
    nullable() {
        this.$schema.nullable = true;
        return this;
    }
    validate(value) {
        if (typeof value !== 'object' || value === null)
            return null;
        if (!Array.isArray(value))
            return null;
        const isNullable = this.$schema.nullable;
        const allValid = value.every((item) => this.$schema.shape.validate(item) !== null || (isNullable && item === null));
        return allValid ? value : null;
    }
    coerce(value) {
        return this.validate(value);
    }
    default(value) {
        this.$schema.default = value;
        return this;
    }
}
