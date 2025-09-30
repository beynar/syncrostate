import type { SyncedArray } from "./array.js";
import type { SyncedSet } from "./set.js";
import type { SyncedObject } from "./object.js";
import type { SyncedMap } from "./map.js";

export type SyncedContainer =
  | SyncedObject
  | SyncedArray
  | SyncedSet
  | SyncedMap;
