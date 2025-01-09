import { STATE_SYMBOL } from './constants.js';
export { syncroState } from './proxys/syncroState.svelte.js';
export { y } from './schemas/schema.js';
export const getSyncroState = (obj) => obj[STATE_SYMBOL];
