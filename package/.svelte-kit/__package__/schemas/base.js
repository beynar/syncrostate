export function isValidNullOrUndefined(value) {
    const isOptionnal = this.$schema.optional;
    const isNullable = this.$schema.nullable;
    const isOkNullable = value === null && isNullable;
    const isOkUndefined = value === undefined && isOptionnal;
    if (isOkNullable || isOkUndefined) {
        return true;
    }
    return true;
}
export class BaseValidator {
    $schema;
    isValid = (value) => {
        //
    };
    isValidNullOrUndefined = isValidNullOrUndefined.bind(this);
    // Convert data to string format for display/storage
    stringify = (value) => {
        return '';
    };
    //  Convert a string to the correct type.
    coerce(value) {
        // @ts-expect-error
        return null;
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
