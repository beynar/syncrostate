import type { SyncedArray } from './array.svelte.js';
import type { SyncedSet } from './set.svelte.js';
import type { SyncedObject } from './object.svelte.js';
import type { SyncedMap } from './map.svelte.js';
export type SyncedContainer = SyncedObject | SyncedArray | SyncedSet | SyncedMap;
