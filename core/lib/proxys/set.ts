import * as Y from "yjs";
import {
  isArrayNull,
  logError,
  observeArray,
  propertyToNumber,
  setArrayToNull,
} from "../utils.js";
import {
  createSyncroState,
  type State,
  type SyncroStates,
} from "./syncroState.js";
import type { SyncedContainer } from "./common.js";
import type { SetValidator } from "../schemas/set.js";
import type { ProviderState } from "../provider.js";

export class SyncedSet {
  state: State;
  validator: SetValidator<any>;
  yType: Y.Array<any>;
  parent: SyncedContainer;
  key: string | number;
  isNull: ProviderState<boolean>;
  syncroStates: ProviderState<SyncroStates[]>;
  syncroStatesValues: Set<any>;
  proxySet: any;
  setNull = setArrayToNull.bind(this);
  observe = observeArray.bind(this);

  constructor(opts: {
    yType: Y.Array<any>;
    validator: SetValidator<any>;
    parent: SyncedContainer;
    key: string | number;
    state: State;
    value: any;
  }) {
    this.key = opts.key;
    this.state = opts.state;
    this.yType = opts.yType;
    this.parent = opts.parent;
    this.validator = opts.validator;
    this.isNull = opts.state.provider.state(false);
    this.syncroStates = opts.state.provider.state([]);
    this.syncroStatesValues = new opts.state.provider.Set();

    this.sync(opts.value);
    this.yType.observe(this.observe);

    this.proxySet = new Proxy(this.syncroStatesValues, {
      get: (target, prop) => {
        if (prop === "getState") {
          return () => this.state;
        }
        if (prop === "getYType") {
          return () => this.yType;
        }
        if (prop === "getYTypes") {
          return () => this.yType.toArray();
        }
        if (prop === Symbol.iterator) {
          return () => this.syncroStatesValues.values();
        }

        const result = Reflect.get(target, prop);
        if (typeof result === "function") {
          return (...args: any[]) => {
            if (typeof prop === "string") {
              switch (prop) {
                case "add": {
                  const { isValid, value } = this.validator.$schema.shape.parse(
                    args[0]
                  );

                  if (!isValid) {
                    logError("Invalid value", { value });
                    return false;
                  }

                  const hasValue = this.syncroStatesValues.has(value);

                  if (hasValue) {
                    return false;
                  }
                  this.state.transaction(() => {
                    const state = createSyncroState({
                      forceNewType: true,
                      key: this.syncroStatesValues.size,
                      validator: this.validator.$schema.shape,
                      parent: this,
                      value: value,
                      state: this.state,
                    });
                    this.addState(state);
                  });

                  return this.proxySet;
                }
                case "delete": {
                  const stateIndex = Array.from(
                    this.syncroStates.value
                  ).findIndex((state) => state.value === args[0]);
                  if (stateIndex !== -1) {
                    this.syncroStates.value[stateIndex]?.destroy();
                  }
                  this.deleteProperty(target, stateIndex);
                  return this.proxySet;
                }
                case "clear":
                  {
                    this.state.transaction(() => {
                      Array.from(this.syncroStates.value).forEach((state) =>
                        state.destroy()
                      );
                      this.yType.delete(0, this.yType.length);
                      this.syncroStatesValues.clear();
                      this.syncroStates.value = [];
                    });
                  }
                  return this.proxySet;
                default:
                  break;
              }
              return result.call(target, ...args);
            }
          };
        } else {
          return result;
        }
      },
    });
  }

  sync = (value: any) => {
    this.state.transaction(() => {
      this.syncroStatesValues.clear();
      this.syncroStates.value = [];
      if (isArrayNull(this)) {
        this.isNull.value = true;
        return;
      }
      if (this.state.initialized || value) {
        for (
          let i = 0;
          i < Math.max(value?.length || 0, this.yType.length);
          i++
        ) {
          this.addState(
            createSyncroState({
              key: i,
              validator: this.validator.$schema.shape,
              parent: this,
              value: value?.[i],
              state: this.state,
            })
          );
        }
      } else {
        if (this.validator.$schema.default) {
          this.syncroStates.value = Array.from(
            this.validator.$schema.default
          ).map((item, index) => {
            const state = createSyncroState({
              key: index,
              validator: this.validator.$schema.shape,
              parent: this,
              value: item,
              state: this.state,
            });
            this.syncroStatesValues.add(state.value);
            return state;
          });
        } else if (this.validator.$schema.nullable && !value) {
          this.setNull();
        }
      }
    });
  };

  toJSON = () => {
    // it's not exactly right but maybe ok and useful
    return Array.from(this.syncroStates.value).map((state) => state.value);
  };

  addState = (state: SyncroStates) => {
    this.syncroStates.value.push(state);
    this.syncroStatesValues.add(state.value);
  };

  deleteProperty = (target: any, prop: any) => {
    const index = propertyToNumber(prop);
    if (typeof index !== "number" || !this.syncroStates.value[index]) {
      return true;
    }

    this.syncroStatesValues.delete(this.syncroStates.value[index].value);
    this.syncroStates.value[index].destroy();
    this.syncroStates.value.splice(index, 1);
    this.yType.delete(index, 1);
  };

  destroy = () => {
    this.syncroStatesValues.clear();
    this.syncroStates.value = [];
  };

  get value() {
    if (this.isNull.value) {
      return null;
    }

    return this.proxySet;
  }

  set value(input: Set<any> | null) {
    const { isValid, value } = this.validator.parse(input);

    this.state.transaction(() => {
      if (!isValid) {
        logError("Invalid value", { value });
        return;
      } else {
        if (!value) {
          if (value === undefined) {
            // this.parent.deleteProperty({}, this.key);
          } else {
            this.setNull();
          }
        } else {
          this.syncroStatesValues.clear();
          const valueArray = Array.from(value);

          if (this.isNull.value) {
            this.isNull.value = false;
            this.yType.delete(0, this.yType.length);
          }

          if (!this.isNull.value) {
            const remainingStates = Array.from(this.syncroStates.value).slice(
              valueArray.length
            );
            remainingStates.forEach((state) => {
              state.destroy();
            });
            if (remainingStates.length) {
              this.yType.delete(valueArray.length, remainingStates.length);
            }
          }

          this.syncroStates.value = valueArray.map((item, index) => {
            const previsousState = this.syncroStates.value[index];
            if (previsousState) {
              previsousState.value = item;
              this.syncroStatesValues.add(previsousState.value);
              return previsousState;
            } else {
              const state = createSyncroState({
                forceNewType: true,
                key: index,
                validator: this.validator.$schema.shape,
                parent: this,
                value: item,
                state: this.state,
              });
              this.syncroStatesValues.add(state.value);
              return state;
            }
          });
        }
      }
    });
  }
}
