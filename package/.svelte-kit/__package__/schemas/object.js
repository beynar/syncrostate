import { BaseValidator, isValidNullOrUndefined } from './base.js';
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
        if (!this.isValidNullOrUndefined(value)) {
            return false;
        }
        return Object.entries(value).every(([key, value]) => {
            const validator = this.$schema.shape[key];
            if (!validator)
                return false;
            return validator.isValid(value);
        });
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
        let allValid = true;
        const validValue = Object.entries(this.$schema.shape).reduce((acc, [key, validator]) => {
            const parsedValue = validator.validate(value[key]);
            const valid = (validator.$schema.optional && value[key] === undefined) ||
                (validator.$schema.nullable && value[key] === null);
            allValid = allValid && valid;
            Object.assign(acc, { [key]: valid ? parsedValue : undefined });
            return acc;
        }, {});
        console.log({ validValue, allValid });
        return allValid ? validValue : null;
    }
    coerce(value) {
        return this.validate(value);
    }
}
