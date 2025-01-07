import * as Y from 'yjs';
import type { Validator } from './schemas/schema.js';
export declare const isMissingOptionnal: ({ parent, key, validator }: {
    parent: Y.Map<any> | Y.Array<any>;
    key: string | number;
    validator: Validator;
}) => boolean;
export declare const getTypeFromParent: <T extends Y.Array<any> | Y.Map<any> | Y.Text>({ parent, key, validator, forceNewType, value }: {
    parent: Y.Map<any> | Y.Array<any>;
    key: string | number;
    value?: string;
    forceNewType?: boolean;
    validator: Validator;
}) => T;
export declare const getInstance: (validator: Validator) => (new () => Y.AbstractType<any>) | null;
