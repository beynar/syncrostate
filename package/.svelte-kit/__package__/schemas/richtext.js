import { BaseValidator } from './base.js';
export class RichTextValidator extends BaseValidator {
    constructor() {
        super({ kind: 'richText', optional: false, nullable: false });
    }
    //
    validate(value) {
        if (typeof value !== 'string')
            return null;
        return value;
    }
    coerce(value) {
        const DEFAULT_VALUE = this.$schema.default ?? null;
        return this.validate(value) ?? DEFAULT_VALUE;
    }
    stringify = (value) => {
        return this.coerce(value)?.toString() ?? '';
    };
}
