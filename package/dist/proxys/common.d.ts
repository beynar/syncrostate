import type { SyncedArray } from './array.svelte.js';
import type { SyncedSet } from './set.svelte.js';
import type { SyncedObject } from './object.svelte.js';
export type SyncedContainer = SyncedObject | SyncedArray | SyncedSet;
