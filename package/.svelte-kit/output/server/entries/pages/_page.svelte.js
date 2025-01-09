import { e as escape_html } from "../../chunks/escaping.js";
import { s as setContext, c as pop, p as push } from "../../chunks/index.js";
import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
const NULL = `$/_NULL_/$`;
const NULL_ARRAY = `$/_NULL_ARRAY_/$`;
const NULL_OBJECT = `$/_NULL_OBJECT_/$`;
const INITIALIZED = `$/_INITIALIZED_/$`;
const CONTEXT_KEY = "SYNCED_STATE_CONTEXT";
const TRANSACTION_KEY = class Transaction {
};
const isMissingOptionnal = ({
  parent,
  key,
  validator
}) => {
  const exists = parent instanceof Y.Map ? parent.has(String(key)) : !!parent.get(Number(key));
  const isMissingOptionnal2 = validator.$schema.optional && !exists;
  const hasDefault = validator.$schema.default !== void 0;
  return isMissingOptionnal2 && !hasDefault;
};
const getInitialStringifiedValue = (value, validator) => {
  if (validator.$schema.kind === "array" || validator.$schema.kind === "object") {
    return void 0;
  }
  const DEFAULT_VALUE = value === null ? null : value ?? validator.$schema.default;
  const isValid = validator.isValid(DEFAULT_VALUE);
  if (!isValid) {
    if (validator.$schema.nullable) {
      return NULL;
    }
    return void 0;
  }
  if (DEFAULT_VALUE !== void 0) {
    const stringifiedDefaultValue = validator.stringify(DEFAULT_VALUE);
    return stringifiedDefaultValue;
  }
};
const getTypeFromParent = ({
  parent,
  key,
  validator,
  forceNewType,
  value
}) => {
  const isArray = parent instanceof Y.Array;
  const instance = getInstance(validator);
  const isText = instance === Y.Text;
  const stringifiedValue = getInitialStringifiedValue(value, validator);
  const type = isText ? new Y.Text(stringifiedValue) : new instance();
  const typeInParent = isArray ? parent.get(Number(key)) : parent.get(String(key));
  const setAndReturnType = () => {
    if (isArray) {
      parent.insert(Number(key), [type]);
    } else {
      parent.delete(String(key));
      parent.set(String(key), type);
    }
    return type;
  };
  if (!typeInParent || typeInParent._item?.deleted || forceNewType) {
    return setAndReturnType();
  }
  if (!(typeInParent instanceof instance)) {
    return setAndReturnType();
  } else {
    return typeInParent;
  }
};
const getInstance = (validator) => {
  switch (validator.$schema.kind) {
    case "object":
      return Y.Map;
    case "array":
      return Y.Array;
    default:
      return Y.Text;
  }
};
const isInitialized = ({ yType }) => {
  return yType.doc?.initialized;
};
const initialize = (doc, cb) => {
  Object.assign(doc, { initialized: doc.getText(INITIALIZED)?.toString() === "true" });
  cb();
  doc.getText(INITIALIZED).insert(0, INITIALIZED);
};
const propertyToNumber = (p) => {
  if (typeof p === "string" && p.trim().length) {
    const asNum = Number(p);
    if (Number.isInteger(asNum)) {
      return asNum;
    }
  }
  return p;
};
const createYTypesArrayProxy = (yType) => {
  return new Proxy([], {
    get: (target, key) => {
      const index = propertyToNumber(key);
      if (typeof index === "number" && index >= 0 && index < yType.length) {
        return yType.get(index);
      }
      return void 0;
    }
  });
};
class SyncedArray {
  state;
  validator;
  yType;
  parent;
  key;
  syncroStates = [];
  proxy;
  initialized = false;
  isNull = false;
  //🚨 Using a derived would be preferable but it breaks the tests :/
  // private array = $derived(this.syncroStates.map((state) => state.value));
  get array() {
    return this.syncroStates.map((state) => state.value);
  }
  deleteProperty = (target, pArg) => {
    const p = propertyToNumber(pArg);
    if (typeof p !== "number") {
      return true;
    }
    if (!this.validator.$schema.shape.$schema.optional) {
      return true;
    }
    const syncroState2 = this.syncroStates[p];
    if (!syncroState2) {
      return true;
    }
    syncroState2.value = void 0;
    return true;
  };
  set value(input) {
    const { isValid, value } = this.validator.parse(input);
    if (!isValid) ;
    else {
      this.state.transaction(() => {
        if (!value) {
          if (value === void 0) {
            this.parent.deleteProperty({}, this.key);
          } else {
            this.setNull();
          }
        } else {
          if (this.isNull) {
            this.isNull = false;
            this.yType.delete(0, this.yType.length);
          }
          if (!this.isNull) {
            const remainingStates = this.syncroStates.slice(value.length);
            remainingStates.forEach((state) => {
              state.destroy();
            });
            if (remainingStates.length) {
              this.yType.delete(value.length, remainingStates.length);
            }
          }
          this.syncroStates = value.map((item, index) => {
            const previsousState = this.syncroStates[index];
            if (previsousState) {
              previsousState.value = item;
              return previsousState;
            } else {
              return createSyncroState({
                key: index,
                forceNewType: true,
                validator: this.validator.$schema.shape,
                parent: this,
                value: item,
                state: this.state
              });
            }
          });
        }
      });
    }
  }
  get value() {
    if (this.isNull) {
      return null;
    }
    return this.proxy;
  }
  constructor({
    validator,
    yType,
    value,
    parent,
    key,
    state
  }) {
    this.validator = validator;
    this.yType = yType;
    this.parent = parent;
    this.key = key;
    this.initialized = isInitialized(this);
    this.state = state;
    yType.observe(this.observe);
    const shape = this.validator.$schema.shape;
    const arrayState = {
      ...state,
      yType,
      yTypes: createYTypesArrayProxy(yType)
    };
    this.proxy = new Proxy([], {
      get: (target, pArg, receiver) => {
        if (pArg === "$state") {
          return arrayState;
        }
        const p = propertyToNumber(pArg);
        if (Number.isInteger(p)) {
          const syncroState2 = this.syncroStates[p];
          if (!syncroState2) {
            return void 0;
          }
          return syncroState2.value;
        } else if (typeof p === "string") {
          if (p in this.methods) {
            return this.methods[p];
          }
          if (p[0] === "$") {
            return Reflect.get(target, p);
          }
          if (p === "toJSON") {
            return this.toJSON();
          }
          if (p === "length") {
            return this.array.length;
          }
        } else if (p === Symbol.toStringTag) {
          return "Array";
        } else if (p === Symbol.iterator) {
          const values = this.array.slice();
          return Reflect.get(values, p);
        }
        return Reflect.get(target, p, receiver);
      },
      set: (target, pArg, value2) => {
        const p = propertyToNumber(pArg);
        if (Number.isInteger(p)) {
          if (value2 === void 0) {
            return this.deleteProperty(target, p);
          }
          const syncroState2 = this.syncroStates[p];
          if (!syncroState2) {
            this.state.transaction(() => {
              this.syncroStates[p] = createSyncroState({
                key: p,
                validator: shape,
                parent: this,
                value: value2,
                state: this.state
              });
            });
          } else {
            syncroState2.value = value2;
          }
        }
        return true;
      },
      deleteProperty: this.deleteProperty,
      has: (target, pArg) => {
        const p = propertyToNumber(pArg);
        if (typeof p !== "number") {
          return Reflect.has(target, p);
        }
        if (p < this.array.lengthUntracked && p >= 0) {
          return true;
        } else {
          return false;
        }
      },
      getOwnPropertyDescriptor: (target, pArg) => {
        const p = propertyToNumber(pArg);
        if (p === "length") {
          return {
            enumerable: false,
            configurable: false,
            writable: true
          };
        }
        if (typeof p === "number" && p >= 0 && p < this.yType.length) {
          return {
            enumerable: true,
            configurable: true,
            writable: true
          };
        }
        return void 0;
      },
      ownKeys: (target) => {
        const keys = [];
        for (let i = 0; i < this.yType.length; i++) {
          keys.push(i + "");
        }
        keys.push("length");
        return keys;
      }
    });
    this.sync(value);
  }
  toJSON = () => {
    return this.array;
  };
  setNull = () => {
    this.isNull = true;
    this.yType.delete(0, this.yType.length);
    this.yType.insert(0, [new Y.Text(NULL_ARRAY)]);
  };
  sync = (value) => {
    this.state.transaction(() => {
      this.syncroStates = [];
      if (this.yType.length === 1 && this.yType.get(0) instanceof Y.Text && this.yType.get(0).toString() === NULL_ARRAY) {
        this.isNull = true;
        return;
      }
      if (value) {
        for (let i = 0; i < Math.max(value?.length || 0, this.yType.length); i++) {
          this.syncroStates[i] = createSyncroState({
            key: i,
            validator: this.validator.$schema.shape,
            parent: this,
            value: value?.[i] || this.validator.$schema.default?.[i],
            state: this.state
          });
        }
      } else {
        if (this.validator.$schema.default) {
          this.syncroStates = this.validator.$schema.default.map((item, index) => {
            return createSyncroState({
              key: index,
              validator: this.validator.$schema.shape,
              parent: this,
              value: item,
              state: this.state
            });
          });
        } else if (this.validator.$schema.nullable && !value) {
          this.setNull();
        }
      }
    });
  };
  observe = (e, _transaction) => {
    if (_transaction.origin !== this.state.transactionKey) {
      let start = 0;
      e.delta.forEach(({ retain, delete: _delete, insert }) => {
        if (retain) {
          start += retain;
        }
        if (_delete) {
          const deleted = this.syncroStates.splice(start, _delete);
          deleted.forEach((state) => {
            state.destroy();
          });
          start -= _delete;
        }
        if (Array.isArray(insert)) {
          for (let i = 0; i < insert.length; i++) {
            if (insert[i] instanceof Y.Text && insert[i].toString() === NULL_ARRAY) {
              this.isNull = true;
              return;
            }
            this.syncroStates.splice(start, 0, createSyncroState({
              key: start,
              validator: this.validator.$schema.shape,
              parent: this,
              state: this.state
            }));
            start += 1;
          }
        }
      });
    }
  };
  methods = {
    slice: (start, end) => {
      return this.array.slice(start, end);
    },
    toReversed: () => {
      return this.array.toReversed();
    },
    forEach: (cb) => {
      return this.array.forEach(cb);
    },
    every: (cb) => {
      return this.array.every(cb);
    },
    filter: (cb) => {
      return this.array.filter(cb);
    },
    find: (cb) => {
      return this.array.find(cb);
    },
    findIndex: (cb) => {
      return this.array.findIndex(cb);
    },
    some: (cb) => {
      return this.array.some(cb);
    },
    includes: (value) => {
      return this.array.includes(value);
    },
    map: (cb) => {
      return this.array.map(cb);
    },
    reduce: (cb, initialValue) => {
      return this.array.reduce(cb, initialValue);
    },
    indexOf: (value) => {
      return this.array.indexOf(value);
    },
    at: (index) => {
      return this.array.at(index)?.value;
    },
    //
    // Mutatives methods
    //
    pop: () => {
      if (!this.syncroStates.length) {
        return void 0;
      }
      const last = this.syncroStates.pop();
      this.state.transaction(() => {
        this.yType.delete(this.yType.length - 1, 1);
        last?.destroy();
      });
      return last?.value;
    },
    shift: () => {
      if (!this.syncroStates.length) {
        return void 0;
      }
      const first = this.syncroStates.shift();
      this.state.transaction(() => {
        this.yType.delete(0, 1);
        first?.destroy();
      });
      return first?.value;
    },
    unshift: (...items) => {
      let result;
      this.state.transaction(() => {
        result = this.syncroStates.unshift(...items.map((item, index) => {
          return createSyncroState({
            forceNewType: true,
            key: index,
            validator: this.validator.$schema.shape,
            parent: this,
            value: item,
            state: this.state
          });
        }));
      });
      return result;
    },
    push: (...items) => {
      this.state.transaction(() => {
        this.syncroStates.push(...items.map((item, index) => {
          return createSyncroState({
            key: this.yType.length,
            validator: this.validator.$schema.shape,
            parent: this,
            value: item,
            state: this.state
          });
        }));
      });
    },
    splice: (start, deleteCount, ..._items) => {
      let result = [];
      this.state.transaction(() => {
        const newSyncroStates = _items.map((item, index) => {
          this.yType.delete(start, deleteCount);
          return createSyncroState({
            key: start + index,
            forceNewType: true,
            validator: this.validator.$schema.shape,
            parent: this,
            value: item,
            state: this.state
          });
        });
        if (deleteCount) {
          for (let i = 0; i < deleteCount; i++) {
            const state = this.syncroStates[start + i];
            if (state) {
              state.destroy();
            }
          }
        }
        result = this.syncroStates.splice(start, deleteCount, ...newSyncroStates);
      });
      return result;
    }
  };
  destroy = () => {
    this.syncroStates.forEach((state) => {
      state.destroy();
    });
    this.syncroStates = [];
    this.yType.unobserve(this.observe);
  };
}
const createYTypesObjectProxy = (yType) => {
  return new Proxy({}, {
    get: (target, key) => {
      if (typeof key === "string" && yType.has(key)) {
        return yType.get(key);
      }
      return void 0;
    }
  });
};
class SyncedObject {
  state;
  validator;
  yType;
  syncroStates = {};
  baseImplementation = {};
  proxy;
  parent;
  key;
  initialized = false;
  isNull = false;
  deleteProperty = (target, p) => {
    if (typeof p !== "string") {
      return true;
    }
    const syncroState2 = this.syncroStates[p];
    if (!syncroState2) {
      return true;
    } else if (!syncroState2.validator.$schema.optional) {
      return true;
    }
    this.yType.delete(p);
    syncroState2.destroy();
    delete this.syncroStates[p];
    return true;
  };
  setNull() {
    this.isNull = true;
    this.yType.set(NULL_OBJECT, new Y.Text(NULL_OBJECT));
  }
  set value(input) {
    const { isValid, value } = this.validator.parse(input);
    if (!isValid) {
      return;
    }
    const shape = this.validator.$schema.shape;
    this.state.transaction(() => {
      if (!value) {
        if (value === void 0) {
          this.parent.deleteProperty({}, this.key);
        } else {
          this.setNull();
        }
      } else {
        if (this.isNull) {
          this.isNull = false;
          this.yType.delete(NULL_OBJECT);
        }
        const remainingStates = Object.keys(this.syncroStates).filter((key) => !(key in value));
        remainingStates.forEach((key) => {
          this.syncroStates[key].destroy();
          delete this.syncroStates[key];
          this.yType.delete(key);
        });
        Object.entries(value).forEach(([key, value2]) => {
          if (key in shape) {
            const syncroState2 = this.syncroStates[key];
            if (syncroState2) {
              syncroState2.value = value2;
            } else {
              this.syncroStates[key] = createSyncroState({
                key,
                validator: shape[key],
                parent: this,
                state: this.state,
                value: value2
              });
            }
          }
        });
      }
    });
  }
  get value() {
    if (this.isNull) {
      return null;
    }
    return this.proxy;
  }
  constructor({
    state,
    observe = true,
    validator,
    yType,
    baseImplementation = {},
    value,
    parent,
    key
  }) {
    this.parent = parent;
    this.state = state;
    this.key = key;
    this.validator = validator;
    this.yType = yType;
    this.baseImplementation = baseImplementation;
    this.initialized = isInitialized(this);
    const shape = this.validator.$schema.shape;
    const objectState = {
      ...state,
      yType,
      yTypes: createYTypesObjectProxy(yType)
    };
    this.proxy = new Proxy({}, {
      get: (target, key2) => {
        if (key2 === "$state") {
          return objectState;
        }
        if (key2 === "toJSON") {
          return this.toJSON();
        }
        const syncroState2 = this.syncroStates[key2];
        if (!syncroState2) {
          return void 0;
        }
        return syncroState2.value;
      },
      set: (target, key2, value2) => {
        if (!(key2 in this.validator.$schema.shape)) {
          return false;
        }
        if (value2 === void 0) {
          return this.deleteProperty(target, key2);
        }
        const syncroState2 = this.syncroStates[key2];
        if (!syncroState2) {
          this.state.transaction(() => {
            this.syncroStates[key2] = createSyncroState({
              key: key2,
              validator: shape[key2],
              parent: this,
              state: this.state,
              value: value2
            });
          });
        } else {
          syncroState2.value = value2;
        }
        return true;
      },
      deleteProperty: this.deleteProperty,
      has: (target, key2) => {
        if (typeof key2 !== "string") {
          return false;
        }
        return this.yType.has(key2);
      },
      getOwnPropertyDescriptor(target, key2) {
        if (typeof key2 === "string" && yType.has(key2) || key2 === "toJSON") {
          return { enumerable: true, configurable: true };
        }
        return void 0;
      },
      ownKeys: () => Array.from(this.yType.keys())
    });
    if (observe) {
      yType.observe(this.observe);
      this.sync(value);
    }
  }
  observe = (e, _transaction) => {
    if (_transaction.origin !== this.state.transactionKey) {
      e.changes?.keys.forEach(({ action }, key) => {
        const syncedType = this.syncroStates[key];
        if (action === "delete" && syncedType) {
          syncedType.destroy();
          delete this.syncroStates[key];
        }
        if (action === "add") {
          const syncroState2 = createSyncroState({
            key,
            validator: this.validator.$schema.shape[key],
            state: this.state,
            parent: this
          });
          Object.assign(this.syncroStates, { [key]: syncroState2 });
        }
      });
      if (this.yType.has(NULL_OBJECT)) {
        this.isNull = true;
        return;
      }
    }
  };
  toJSON = () => {
    return Object.entries(this.validator.$schema.shape).reduce(
      (acc, [key, validator]) => {
        const value = this.syncroStates[key]?.value;
        if (value !== void 0) {
          Object.assign(acc, { [key]: value });
        }
        return acc;
      },
      {}
    );
  };
  sync = (value) => {
    this.state.transaction(() => {
      this.syncroStates = {};
      if (this.yType.has(NULL_OBJECT)) {
        this.isNull = true;
        return;
      }
      const hasDefaultValue = this.validator.$schema.default;
      if (!hasDefaultValue) {
        if (this.validator.$schema.nullable && !value) {
          this.setNull();
          return;
        }
      }
      Object.entries(this.validator.$schema.shape).forEach(([key, validator]) => {
        if (isMissingOptionnal({ validator, parent: this.yType, key })) {
          return;
        }
        this.syncroStates[key] = createSyncroState({
          key,
          validator,
          parent: this,
          value: value?.[key] || this.validator.$schema.default?.[key],
          state: this.state
        });
      });
    });
  };
  destroy = () => {
    this.yType.unobserve(this.observe);
    Object.values(this.syncroStates).forEach((syncroState2) => {
      syncroState2.destroy();
    });
    this.syncroStates = {};
  };
}
function isValidNullOrUndefined(value) {
  const isOptionnal = this.$schema.optional;
  const isNullable = this.$schema.nullable;
  const isOkNullable = value === null && isNullable;
  const isOkUndefined = value === void 0 && isOptionnal;
  if (isOkNullable || isOkUndefined) {
    return true;
  }
  return true;
}
class BaseValidator {
  $schema;
  isValid = (value) => {
  };
  isValidNullOrUndefined = isValidNullOrUndefined.bind(this);
  // Convert data to string format for display/storage
  stringify = (value) => {
    return "";
  };
  //  Convert a string to the correct type.
  coerce(value) {
    return null;
  }
  constructor(schema) {
    this.$schema = schema;
  }
  optional() {
    this.$schema.optional = true;
    return this;
  }
  nullable() {
    this.$schema.nullable = true;
    return this;
  }
  default(value) {
    this.$schema.default = value;
    return this;
  }
}
class ObjectValidator {
  $schema;
  constructor(shape) {
    this.$schema = {
      kind: "object",
      optional: false,
      nullable: false,
      shape
    };
  }
  isValidNullOrUndefined = isValidNullOrUndefined.bind(this);
  isValid = (value) => {
    if (value === null) {
      return this.$schema.nullable;
    }
    if (value === void 0) {
      return this.$schema.optional;
    }
    if (typeof value === "object") {
      return Object.entries(this.$schema.shape).every(([key, validator]) => {
        return validator.isValid(value[key]);
      });
    }
    return false;
  };
  optional() {
    this.$schema.optional = true;
    return this;
  }
  nullable() {
    this.$schema.nullable = true;
    return this;
  }
  default(value) {
    this.$schema.default = value;
    return this;
  }
  coerce(value) {
    const isObject = typeof value === "object" && value !== null;
    if (!isObject) {
      return null;
    }
    return Object.entries(this.$schema.shape).reduce((acc, [key, validator]) => {
      Object.assign(acc, { [key]: validator.coerce(value[key]) });
      return acc;
    }, {});
  }
  parse(value) {
    const coerced = this.coerce(value);
    const isValid = this.isValid(value);
    return {
      isValid,
      value: isValid ? coerced : null
    };
  }
}
class BaseSyncedType {
  yType;
  rawValue = "";
  observeCallback;
  state;
  parent;
  key;
  constructor(opts) {
    this.yType = opts.yType;
    this.rawValue = opts.yType.toString();
    this.yType.observe(this.observe);
    this.parent = opts.parent;
    this.key = opts.key;
    this.state = opts.state;
  }
  deletePropertyFromParent = () => {
    this.parent.deleteProperty({}, this.key);
  };
  observe = (e, transact) => {
    if (transact.origin !== this.state.transactionKey) {
      this.rawValue = this.yType.toString();
      this.observeCallback?.(e, transact);
    }
  };
  destroy = () => {
    this.yType.unobserve(this.observe);
  };
  setYValue(value) {
    if (this.rawValue !== value) {
      const length = this.yType.length;
      this.rawValue = value;
      this.state.transaction(() => {
        this.yType.applyDelta(length ? [
          { delete: length },
          { insert: value ?? NULL }
        ] : [{ insert: value ?? NULL }]);
      });
    }
  }
}
class SyncedEnum extends BaseSyncedType {
  validator;
  firstValue;
  get value() {
    const value = this.validator.coerce(this.rawValue);
    if (!this.validator.$schema.nullable && value === null) {
      return this.validator.$schema.default || this.firstValue;
    }
    if (!this.validator.$schema.optional && value === void 0) {
      return this.validator.$schema.default || this.firstValue;
    }
    return value;
  }
  set value(value) {
    if (!this.validator.isValid(value)) {
      return;
    }
    if (value === void 0) {
      this.deletePropertyFromParent();
    } else {
      this.setYValue(this.validator.stringify(value));
    }
  }
  constructor(opts) {
    super(opts);
    this.firstValue = opts.validator.$schema.values.values().next().value;
    this.validator = opts.validator;
  }
}
const SvelteDate = globalThis.Date;
const SvelteDateProxy = (onSet) => {
  const date = new SvelteDate();
  return new Proxy(date, {
    get(target, prop) {
      const result = Reflect.get(target, prop);
      if (typeof result === "function") {
        return (...args) => {
          const ret = result.call(target, ...args);
          if (typeof prop === "string" && prop.startsWith("set")) {
            onSet();
          }
          return ret;
        };
      } else {
        return result;
      }
    }
  });
};
class SyncedDate extends BaseSyncedType {
  validator;
  date = SvelteDateProxy(() => {
    const newRawValue = this.date.toISOString();
    const isNull = this.date.getTime() === 0;
    if (newRawValue !== this.rawValue && !isNull) {
      this.setYValue(newRawValue);
    }
  });
  get value() {
    const value = this.rawValue === NULL || !this.rawValue ? null : this.date;
    if (!this.validator.$schema.nullable && value === null) {
      return this.date;
    }
    if (!this.validator.$schema.optional && value === void 0) {
      return this.date;
    }
    return value;
  }
  set value(value) {
    const isValid = this.validator.isValid(value);
    if (!isValid) {
      return;
    }
    if (value !== null && value !== void 0) {
      this.setYValue(new Date(value).toISOString());
      this.date.setTime(new Date(value).getTime());
    } else {
      if (value === void 0) {
        this.deletePropertyFromParent();
      } else {
        this.setYValue(null);
        this.date.setTime(0);
      }
    }
  }
  setValue = (string) => {
    const { isValid, value } = this.validator.parse(string);
    if (isValid) {
      this.date.setTime(value?.getTime() || 0);
    }
  };
  observeCallback = () => {
    this.setValue(this.rawValue);
  };
  constructor(opts) {
    super(opts);
    this.validator = opts.validator;
    this.setValue(this.rawValue);
  }
}
class SyncedBoolean extends BaseSyncedType {
  validator;
  get value() {
    const value = this.validator.coerce(this.rawValue);
    if (!this.validator.$schema.nullable && value === null) {
      return this.validator.$schema.default || false;
    }
    if (!this.validator.$schema.optional && value === void 0) {
      return this.validator.$schema.default || false;
    }
    return value;
  }
  set value(value) {
    if (!this.validator.isValid(value)) {
      return;
    }
    if (value === void 0) {
      this.deletePropertyFromParent();
    } else {
      this.setYValue(this.validator.stringify(value));
    }
  }
  constructor(opts) {
    super(opts);
    this.validator = opts.validator;
  }
}
class SyncedText extends BaseSyncedType {
  validator;
  get value() {
    return this.rawValue === NULL ? null : this.rawValue;
  }
  set value(value) {
    const isValid = this.validator.isValid(value);
    if (!isValid) {
      return;
    }
    if (value === void 0) {
      this.deletePropertyFromParent();
    } else {
      this.setYValue(this.validator.stringify(value));
    }
  }
  constructor(opts) {
    super(opts);
    this.validator = opts.validator;
  }
}
class SyncedNumber extends BaseSyncedType {
  validator;
  get value() {
    return this.validator.coerce(this.rawValue);
  }
  set value(value) {
    if (!this.validator.isValid(value)) {
      return;
    }
    if (value === void 0) {
      this.deletePropertyFromParent();
    } else {
      this.setYValue(this.validator.stringify(value));
    }
  }
  constructor(opts) {
    super(opts);
    this.validator = opts.validator;
  }
}
const safeSetContext = (key, value) => {
  try {
    setContext(key, value);
  } catch (e) {
  }
};
const syncroState = ({ schema, connect }) => {
  const doc = new Y.Doc();
  const awareness = new Awareness(doc);
  const schemaValidator = new ObjectValidator(schema);
  const stateMap = doc.getMap("$state");
  const undoManager = new Y.UndoManager(stateMap);
  let state = {
    remotlySynced: false,
    locallySynced: connect ? false : true,
    connectionStatus: "DISCONNECTED",
    awareness,
    doc,
    undoManager,
    transaction: (fn) => {
      state.doc.transact(fn, TRANSACTION_KEY);
    },
    transactionKey: TRANSACTION_KEY,
    sharedType: stateMap,
    sharedTypes: {},
    undo: () => {
      if (undoManager?.canUndo()) {
        undoManager.undo();
      }
    },
    redo: () => {
      if (undoManager?.canRedo()) {
        undoManager.redo();
      }
    }
  };
  safeSetContext(CONTEXT_KEY, state);
  const syncroStateProxy = new SyncedObject({
    // @ts-ignore
    parent: {
      deleteProperty(target, pArg) {
        return true;
      }
    },
    state,
    key: "$state",
    validator: schemaValidator,
    observe: false,
    yType: stateMap
  });
  if (!connect) {
    initialize(doc, () => {
      syncroStateProxy.sync(syncroStateProxy.value);
      stateMap.observe(syncroStateProxy.observe);
    });
  }
  return syncroStateProxy.value;
};
const createSyncroState = ({
  key,
  validator,
  forceNewType,
  value,
  parent,
  state
}) => {
  const type = getTypeFromParent({
    forceNewType,
    parent: parent.yType,
    key,
    validator,
    value
  });
  switch (validator.$schema.kind) {
    default:
    case "string": {
      return new SyncedText({ yType: type, validator, parent, key, state });
    }
    case "number": {
      return new SyncedNumber({ yType: type, validator, parent, key, state });
    }
    case "boolean": {
      return new SyncedBoolean({ yType: type, validator, parent, key, state });
    }
    case "date": {
      return new SyncedDate({ yType: type, validator, parent, key, state });
    }
    case "enum": {
      return new SyncedEnum({ yType: type, validator, parent, key, state });
    }
    case "object": {
      return new SyncedObject({
        yType: type,
        validator,
        baseImplementation: {},
        value,
        parent,
        key,
        state
      });
    }
    case "array": {
      return new SyncedArray({
        yType: type,
        validator,
        value,
        parent,
        key,
        state
      });
    }
  }
};
class ArrayValidator {
  $schema;
  constructor(shape) {
    this.$schema = {
      kind: "array",
      optional: false,
      nullable: false,
      shape
    };
  }
  isValidNullOrUndefined = isValidNullOrUndefined.bind(this);
  get defaultValue() {
    return this.$schema.default || null;
  }
  isValid = (value) => {
    if (Array.isArray(value)) {
      return value.every((item) => this.$schema.shape.isValid(item));
    }
    if (value === null) {
      return this.$schema.nullable;
    }
    if (value === void 0) {
      return this.$schema.optional;
    }
    return false;
  };
  optional() {
    this.$schema.optional = true;
    return this;
  }
  nullable() {
    this.$schema.nullable = true;
    return this;
  }
  coerce(value) {
    const isArray = Array.isArray(value);
    const validItems = isArray ? value.filter((item) => this.$schema.shape.isValid(item)) : [];
    const someValid = validItems.length > 0;
    if (isArray && someValid) {
      return validItems.map((item) => this.$schema.shape.coerce(item));
    }
    if (value === null && this.$schema.nullable) {
      return null;
    }
    return this.defaultValue;
  }
  parse(value) {
    const coerced = this.coerce(value);
    return {
      isValid: this.isValid(value),
      value: coerced
    };
  }
  default(value) {
    this.$schema.default = value;
    return this;
  }
}
class BooleanValidator extends BaseValidator {
  constructor() {
    super({ kind: "boolean", optional: false, nullable: false });
  }
  get defaultValue() {
    return this.$schema.default || null;
  }
  isValid = (value) => {
    if (typeof value === "boolean") {
      return true;
    }
    if (value === null) {
      return this.$schema.nullable;
    }
    if (value === void 0) {
      return this.$schema.optional;
    }
    return false;
  };
  parse(value) {
    const coerced = this.coerce(value);
    return {
      isValid: this.isValid(coerced),
      value: coerced
    };
  }
  coerce(value) {
    if (value === NULL || value === null) {
      if (this.$schema.nullable) {
        return null;
      } else {
        return this.defaultValue;
      }
    }
    if (value === "true") return true;
    if (value === "false") return false;
    return this.$schema.nullable ? null : this.defaultValue;
  }
  stringify = (value) => {
    if (typeof value === "boolean") {
      return value ? "true" : "false";
    } else {
      if (this.$schema.nullable) {
        return NULL;
      } else {
        return this.defaultValue === null ? NULL : this.defaultValue ? "true" : "false";
      }
    }
  };
}
class DateValidator extends BaseValidator {
  constructor() {
    super({ kind: "date", optional: false, nullable: false });
  }
  min(date) {
    this.$schema.min = date;
    return this;
  }
  max(date) {
    this.$schema.max = date;
    return this;
  }
  isStringADate(value) {
    try {
      return !isNaN(new Date(value).getTime());
    } catch (error) {
      return false;
    }
  }
  get defaultValue() {
    return this.$schema.default || null;
  }
  isValid = (value) => {
    if (value instanceof Date) {
      if (this.$schema.min && value < this.$schema.min) {
        return false;
      }
      if (this.$schema.max && value > this.$schema.max) {
        return false;
      }
      return true;
    }
    if (value === NULL || value === null) {
      return this.$schema.nullable;
    }
    if (value === void 0) {
      return this.$schema.optional;
    }
    return false;
  };
  parse(value) {
    const coerced = this.coerce(value);
    return {
      isValid: this.isValid(coerced),
      value: coerced
    };
  }
  coerce(value) {
    if (value === NULL || value === null || value === void 0) {
      if (this.$schema.nullable) {
        return null;
      } else {
        return this.defaultValue;
      }
    }
    if (value === void 0) {
      return this.$schema.optional ? null : this.defaultValue;
    }
    if (this.isStringADate(value)) {
      return new Date(value);
    }
    return this.$schema.nullable ? null : this.defaultValue;
  }
  stringify = (value) => {
    if (value instanceof Date) {
      return value.toISOString();
    } else {
      if (this.$schema.nullable) {
        return NULL;
      } else {
        return this.defaultValue?.toISOString() || NULL;
      }
    }
  };
}
class EnumValidator extends BaseValidator {
  constructor(...values) {
    super({ kind: "enum", optional: false, nullable: false, values: new Set(values) });
  }
  get defaultValue() {
    return this.$schema.default || null;
  }
  isValid = (value) => {
    if (this.$schema.values.has(value)) {
      return true;
    }
    if (value === NULL || value === null) {
      return this.$schema.nullable;
    }
    if (value === void 0) {
      return this.$schema.optional;
    }
    return false;
  };
  parse(value) {
    const coerced = this.coerce(value);
    return {
      isValid: this.isValid(coerced),
      value: coerced
    };
  }
  coerce(value) {
    if (value === NULL || value === null) {
      if (this.$schema.nullable) {
        return null;
      } else {
        return this.defaultValue;
      }
    }
    if (value === void 0) {
      return this.$schema.optional ? null : this.defaultValue;
    }
    if (this.$schema.values.has(value)) return value;
    return this.$schema.nullable ? null : this.defaultValue;
  }
  stringify = (value) => {
    if (value === null) return NULL;
    return this.coerce(value)?.toString() ?? "";
  };
}
class StringValidator extends BaseValidator {
  constructor() {
    super({ kind: "string", optional: false, nullable: false });
  }
  get defaultValue() {
    return this.$schema.default || null;
  }
  min(length) {
    this.$schema.min = length;
    return this;
  }
  max(length) {
    this.$schema.max = length;
    return this;
  }
  pattern(regex) {
    this.$schema.pattern = regex;
    return this;
  }
  isValid = (value) => {
    if (typeof value === "string") {
      if (this.$schema.min && value.length < this.$schema.min) return false;
      if (this.$schema.max && value.length > this.$schema.max) return false;
      if (this.$schema.pattern && !this.$schema.pattern.test(value)) return false;
      return true;
    }
    if (value === NULL || value === null) {
      return this.$schema.nullable;
    }
    if (value === void 0) {
      return this.$schema.optional;
    }
    return false;
  };
  parse(value) {
    const coerced = this.coerce(value);
    return {
      isValid: this.isValid(coerced),
      value: coerced
    };
  }
  coerce(value) {
    if (value === NULL || value === null) {
      if (this.$schema.nullable) {
        return null;
      } else {
        return this.defaultValue;
      }
    }
    if (value === void 0) {
      return this.$schema.nullable ? null : this.defaultValue;
    }
    if (typeof value === "string") {
      return value;
    }
    return this.$schema.nullable ? null : this.defaultValue;
  }
  stringify = (value) => {
    if (typeof value === "string") {
      return value;
    } else {
      if (this.$schema.nullable) {
        return NULL;
      } else {
        return this.defaultValue || NULL;
      }
    }
  };
}
class RichTextValidator extends BaseValidator {
  constructor() {
    super({ kind: "richText", optional: false, nullable: false });
  }
  //
  validate(value) {
    if (typeof value !== "string") return null;
    return value;
  }
  coerce(value) {
    const DEFAULT_VALUE = this.$schema.default ?? null;
    return this.validate(value) ?? DEFAULT_VALUE;
  }
  stringify = (value) => {
    return this.coerce(value)?.toString() ?? "";
  };
}
class NumberValidator extends BaseValidator {
  constructor() {
    super({ kind: "number", optional: false, nullable: false });
  }
  get defaultValue() {
    return this.$schema.default || null;
  }
  isValid = (value) => {
    if (typeof value === "number" && !isNaN(value)) {
      return true;
    }
    if (value === NULL || value === null) {
      return this.$schema.nullable;
    }
    if (value === void 0) {
      return this.$schema.optional;
    }
    return false;
  };
  parse(value) {
    const coerced = this.coerce(value);
    return {
      isValid: this.isValid(coerced),
      value: coerced
    };
  }
  coerce(value) {
    if (value === NULL || value === null) {
      if (this.$schema.nullable) {
        return null;
      } else {
        return this.defaultValue;
      }
    }
    if (value === void 0) {
      return this.$schema.optional ? null : this.defaultValue;
    }
    const parsed = Number(value);
    if (isNaN(parsed)) {
      return this.$schema.nullable ? null : this.defaultValue;
    }
    return parsed;
  }
  stringify = (value) => {
    if (typeof value === "number") {
      return String(value);
    } else {
      if (this.$schema.nullable) {
        return NULL;
      } else {
        return this.defaultValue?.toString() || NULL;
      }
    }
  };
}
const y = {
  boolean: () => new BooleanValidator(),
  date: () => new DateValidator(),
  enum: (...values) => new EnumValidator(...values),
  string: () => new StringValidator(),
  richText: () => new RichTextValidator(),
  object: (shape) => new ObjectValidator(shape),
  array: (shape) => new ArrayValidator(shape),
  number: () => new NumberValidator()
};
function _page($$payload, $$props) {
  push();
  const synced = syncroState({
    // connect: async ({ doc }) => {
    // 	return new Promise((resolve, reject) => {
    // 		const client = createClient({
    // 			publicApiKey: 'pk_prod_TXiiCUekyBO_3gntGdLDEyqmJ0Qc6AqyfAoz0Pntk5JlzC4sSWFmjh4cP73rWXpm'
    // 		});
    // 		const { room } = client.enterRoom('your-room-id-5');
    // 		const yProvider = new LiveblocksYjsProvider(room, doc);
    // 		yProvider.on('synced', () => {
    // 			resolve();
    // 		});
    // 	});
    // },
    schema: {
      name: y.string().default("John").optional(),
      gender: y.enum("male", "female").default("female").nullable(),
      firstName: y.string().default("Doe"),
      birthday: y.date().default(/* @__PURE__ */ new Date()).nullable(),
      age: y.number().nullable().default(30),
      friends: y.array(y.string().optional()).default(["Test"]),
      family: y.array(y.object({ name: y.string() })),
      nodes: y.array(y.object({
        type: y.enum("rect", "circle"),
        x: y.number(),
        y: y.number(),
        width: y.number(),
        height: y.number(),
        fill: y.string()
      })),
      father: y.object({
        name: y.string().default("Alfred"),
        wife: y.object({ name: y.string() })
      }).optional()
    }
  });
  let friends = ["John"];
  if (synced.$state.remotlySynced) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="prose prose-sm"><code>${escape_html(JSON.stringify(synced, null, 2))}</code></div> <div class="prose prose-sm"><code>${escape_html(JSON.stringify(friends, null, 2))}</code></div> <div class="grid gap-2"><button>Push node</button> <button>name: ${escape_html(synced.name)}</button> <button>family name: ${escape_html(synced.family?.[0]?.name)}</button> <button>set friends[0] ${escape_html(synced.friends[0])}</button> <button>reset friends</button> <button>splice friends</button> <button>push friends</button> <button>pop friends</button> <button>unshift friends</button> <button>delete friends</button> <button>set friends</button></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  pop();
}
export {
  _page as default
};