export type ProviderState<T> = {
  value: T;
};

export type ProviderEffect = (cb: () => void, deps?: any[]) => void;

export type ProviderDerived<T> = (cb: () => T) => {
  value: T;
};

export interface Provider {
  state: <T>(initialValue: T) => {
    value: T;
  };
  effect: (cb: () => void, deps?: any[]) => void;
  derived: <T>(cb: () => T) => {
    value: T;
  };
  onMount: (cb: () => void) => void;
  onDestroy: (cb: () => void) => void;
  Map: typeof Map;
  Set: typeof Set;
  Date: typeof Date;
  getContext: <T>(key: string) => T;
  setContext: <T>(key: string, value: T) => void;
}
