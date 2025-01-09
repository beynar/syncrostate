export type BaseSchema<T> = {
    kind: 'array' | 'object' | 'string' | 'boolean' | 'number' | 'enum' | 'date' | 'richText';
    optional: boolean;
    nullable: boolean;
    default?: T;
};
export declare function isValidNullOrUndefined(this: {
    $schema: BaseSchema<any>;
}, value: any): boolean;
export declare class BaseValidator<S extends BaseSchema<any>, O extends boolean = false, N extends boolean = false> {
    $schema: S;
    isValid: (value: any) => void;
    isValidNullOrUndefined: (value: any) => boolean;
    stringify: (value: any) => string;
    coerce(value: any): S extends BaseSchema<infer T> ? T | null : any;
    constructor(schema: S);
    optional(): BaseValidator<S, true, N>;
    nullable(): BaseValidator<S, O, true>;
    default(value: S extends BaseSchema<infer T> ? T : never): BaseValidator<S, O, N>;
}
