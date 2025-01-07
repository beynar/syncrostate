import { BaseValidator, type BaseSchema } from './base.js';
export type DateSchema = BaseSchema<Date> & {
    kind: 'date';
    min?: Date;
    max?: Date;
};
export declare class DateValidator<O extends boolean = false, N extends boolean = false> extends BaseValidator<DateSchema, O, N> {
    constructor();
    min(date: Date): DateValidator<O, N>;
    max(date: Date): DateValidator<O, N>;
    private isStringADate;
    isValid: (value: any) => boolean;
    parse(value: string | null): {
        isValid: boolean;
        value: Date | null;
    };
    coerce(value: string | null): Date | null;
    stringify: (value: any) => string;
}
