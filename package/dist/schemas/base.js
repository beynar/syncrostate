export function isValidNullOrUndefined(value) {
    const isOptionnal = this.$schema.optional;
    const isNullable = this.$schema.nullable;
    if (value === null && !isNullable) {
        return false;
    }
    if (value === undefined && !isOptionnal) {
        return false;
    }
    return true;
}
export class BaseValidator {
    $schema;
    isValid = (value) => {
        //
    };
    isValidNullOrUndefined = isValidNullOrUndefined.bind(this);
    validateType(value) {
        // @ts-expect-error
        return null;
    }
    // Convert data to string format for display/storage
    stringify = (value) => {
        return '';
    };
    //  Convert a string to the correct type.
    coerce(value) {
        // @ts-expect-error
        return null;
    }
    // Returns the valid value or null. Ensure data strictly matches your schema
    validate(value) {
        if (value === null && !this.$schema.nullable)
            return null;
        if (value === undefined && !this.$schema.optional)
            return null;
        return this.validateType(value);
    }
    constructor(schema) {
        this.$schema = schema;
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
        this.$schema.default = value;
        return this;
    }
}
