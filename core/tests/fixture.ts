import { computed, effect, signal } from "alien-signals";
import type { Provider } from "../lib/provider.js";
import type { ObjectShape } from "../lib/schemas/object.js";
import {
  syncroState,
  type SyncroStateOptions,
} from "../lib/proxys/syncroState.js";

// Polyfill for $state in test environment
(globalThis as any).$state = <T>(value: T): T => value;

const vanillaState = <T>(initialValue: T) => {
  let state = signal(initialValue);
  return {
    get value() {
      return state();
    },
    set value(value: T) {
      state(value);
    },
  };
};

const vanillaEffect = (cb: () => void, deps?: any[]) => {
  effect(() => {
    cb();
  });
};

const vanillaDerived = <T>(cb: () => T) => {
  const derivedValue = computed(cb);
  return {
    get value() {
      return derivedValue();
    },
  };
};

export class VanillaProvider implements Provider {
  private context = new Map<string, any>();

  getContext = <T>(key: string): T => {
    if (!this.context.has(key)) {
      throw new Error(`Context key "${key}" not found`);
    }
    return this.context.get(key) as T;
  };

  setContext = <T>(key: string, value: T): void => {
    this.context.set(key, value);
  };
  state = vanillaState;
  effect = vanillaEffect;
  derived = vanillaDerived;
  Map = Map;
  Set = Set;
  onMount = (cb: () => void) => {
    cb();
  };
  onDestroy = (cb: () => void) => {
    // cb();
  };
  Date = Date;
}

export const createSyncroState = <T extends ObjectShape>(
  options: Omit<SyncroStateOptions<T>, "provider">
) => {
  return syncroState({
    ...options,
    provider: new VanillaProvider(),
  });
};
