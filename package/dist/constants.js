// Used to mark a value as null because Yjs doesn't support null values
export const NULL = `$/_NULL_/$`;
export const NULL_ARRAY = `$/_NULL_ARRAY_/$`;
export const NULL_OBJECT = `$/_NULL_OBJECT_/$`;
// Used to mark a value as initialized in the root document and skip the initial validation
export const INITIALIZED = `$/_INITIALIZED_/$`;
export const CONTEXT_KEY = 'SYNCED_STATE_CONTEXT';
export const TRANSACTION_KEY = class Transaction {
};
export const STATE_SYMBOL = Symbol('$STATE');
