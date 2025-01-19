import { isValidNullOrUndefined } from './base.js';
export class ObjectValidator {
    $schema;
    constructor(shape) {
        this.$schema = {
            kind: 'object',
            optional: false,
            nullable: false,
            shape
        };
    }
    isValidNullOrUndefined = isValidNullOrUndefined.bind(this);
    isValid = (value) => {
        if (value === null) {
            return this.$schema.nullable;
        }
        if (value === undefined) {
            return this.$schema.optional;
        }
        if (typeof value === 'object') {
            return Object.entries(this.$schema.shape).every(([key, validator]) => {
                return validator.isValid(value[key]);
            });
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
        this.$schema.default = value;
        return this;
    }
    coerce(value) {
        const isObject = typeof value === 'object' && value !== null;
        if (!isObject) {
            return null;
        }
        return Object.entries(this.$schema.shape).reduce((acc, [key, validator]) => {
            const isValid = validator.isValid(value[key]);
            if (!isValid) {
                return acc;
            }
            Object.assign(acc, { [key]: value[key] });
            return acc;
        }, {});
    }
    parse(value) {
        const coerced = this.coerce(value);
        const isValid = this.isValid(value);
        return {
            isValid,
            value: isValid ? coerced : null
        };
    }
}
