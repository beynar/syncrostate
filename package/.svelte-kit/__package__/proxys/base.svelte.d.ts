import * as Y from 'yjs';
import type { Validator } from '../schemas/schema.js';
type ObserverCallback = (e: Y.YEvent<Y.Text>, transact: Y.Transaction) => void;
export declare const getInitialStringifiedValue: (value: any, validator: Validator) => string | undefined;
export declare class BaseSyncedType {
    INTERNAL_ID: string;
    yType: Y.Text;
    rawValue: string | null;
    observeCallback?: ObserverCallback;
    constructor(yType: Y.Text);
    observe: (e: Y.YEvent<Y.Text>, transact: Y.Transaction) => void;
    destroy: () => void;
    setYValue(value: string | null): void;
    [Symbol.dispose](): void;
}
export {};
