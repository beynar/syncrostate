import type { RichTextValidator } from '../schemas/richtext.js';
import * as Y from 'yjs';
type Delta = {
    insert: string;
    attributes: Record<string, any>;
} | {
    delete: number;
} | {
    retain: number;
};
export declare class SyncedRichText {
    #private;
    INTERNAL_ID: `${string}-${string}-${string}-${string}-${string}`;
    validator: RichTextValidator;
    private yType;
    constructor(yType: Y.Text, validator: RichTextValidator);
    get text(): string;
    get content(): any;
    format: (index: number, length: number, attributes?: Record<string, any>) => void;
    insert: (index: number, value: string, attributes?: Record<string, any>) => void;
    delete: (index: number, length?: number) => void;
    applyDelta: (...delta: Delta[]) => void;
}
export {};
