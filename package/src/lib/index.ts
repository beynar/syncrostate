import { STATE_SYMBOL } from './constants.js';
import type { State } from './proxys/syncroState.svelte.js';

export { syncroState } from './proxys/syncroState.svelte.js';
export { y } from './schemas/schema.js';

export const getSyncroState = (obj: any): State | undefined | undefined => obj[STATE_SYMBOL];
