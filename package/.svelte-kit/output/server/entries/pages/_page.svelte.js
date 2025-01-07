import { e as escape_html } from "../../chunks/escaping.js";
import { s as setContext, c as pop, p as push } from "../../chunks/index.js";
import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
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
  const type = isText && value ? new Y.Text(value) : new instance();
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
  if (validator) {
    switch (validator.$schema.kind) {
      case "object":
        return Y.Map;
      case "array":
        return Y.Array;
      default:
        return Y.Text;
    }
  }
  return null;
};
class SyncedObject {
  INTERNAL_ID;
  validator;
  yType;
  syncroStates = {};
  baseImplementation = {};
  proxy;
  deleteProperty = (target, p) => {
    if (typeof p !== "string") {
      return true;
    }
    const syncroState2 = this.syncroStates[p];
    if (!syncroState2) {
      console.error("Property does not exist", p);
      return true;
    } else if (!syncroState2.validator.$schema.optional) {
      console.error("Can not delete non optional property", p);
      return true;
    }
    this.yType.delete(p);
    syncroState2.destroy();
    delete this.syncroStates[p];
    return true;
  };
  transact = (fn) => {
    this.yType.doc?.transact(fn, this.INTERNAL_ID);
  };
  set value(value) {
    if (!this.validator.isValid(value)) {
      console.error("Invalid value", { value });
      return;
    }
    const shape = this.validator.$schema.shape;
    this.transact(() => {
      const remainingStates = Object.keys(this.syncroStates).filter((key) => !(key in value));
      remainingStates.forEach((key) => {
        this.syncroStates[key].destroy();
        delete this.syncroStates[key];
      });
      Object.entries(value).forEach(([key, value2]) => {
        if (key in shape) {
          if (this.syncroStates[key]) {
            this.syncroStates[key].value = value2;
          } else {
            this.syncroStates[key] = createSyncroState({
              key,
              validator: shape[key],
              parent: this.yType,
              value: value2
            });
          }
        }
      });
    });
  }
  get value() {
    return this.proxy;
  }
  constructor({
    observe = true,
    validator,
    yType,
    baseImplementation = {},
    value
  }) {
    this.INTERNAL_ID = crypto.randomUUID();
    this.validator = validator;
    this.yType = yType;
    this.baseImplementation = baseImplementation;
    const shape = this.validator.$schema.shape;
    this.proxy = new Proxy(this.baseImplementation, {
      get: (target, key) => {
        if (key[0] === "$") {
          return Reflect.get(target, key);
        }
        if (key === "toJSON") {
          return this.toJSON();
        }
        const syncroState2 = this.syncroStates[key];
        if (!syncroState2) {
          return void 0;
        }
        return syncroState2.value;
      },
      set: (target, key, value2) => {
        if (!(key in this.validator.$schema.shape)) {
          return false;
        }
        if (value2 === void 0) {
          return this.deleteProperty(target, key);
        }
        const syncroState2 = this.syncroStates[key];
        if (!syncroState2) {
          this.transact(() => {
            this.syncroStates[key] = createSyncroState({
              key,
              validator: shape[key],
              parent: this.yType,
              value: value2
            });
          });
        } else {
          syncroState2.value = value2;
        }
        return true;
      },
      deleteProperty: this.deleteProperty,
      has: (target, key) => {
        if (typeof key !== "string") {
          return false;
        }
        return this.yType.has(key);
      },
      getOwnPropertyDescriptor(target, key) {
        if (typeof key === "string" && yType.has(key) || key === "toJSON") {
          return { enumerable: true, configurable: true };
        }
        return void 0;
      },
      ownKeys: () => Array.from(this.yType.keys())
    });
    if (observe) {
      yType.observe(this.observe);
      this.sync(value || this.validator.$schema.default);
    }
  }
  observe = (e, _transaction) => {
    if (_transaction.origin === this.INTERNAL_ID) {
      return;
    }
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
          parent: this.yType
        });
        Object.assign(this.syncroStates, { [key]: syncroState2 });
      }
    });
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
    this.syncroStates = {};
    Object.entries(this.validator.$schema.shape).forEach(([key, validator]) => {
      if (isMissingOptionnal({ validator, parent: this.yType, key })) {
        return;
      }
      this.syncroStates[key] = createSyncroState({
        key,
        validator,
        parent: this.yType,
        value: value?.[key]
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
  if (value === null && !isNullable) {
    return false;
  }
  if (value === void 0 && !isOptionnal) {
    return false;
  }
  return true;
}
class BaseValidator {
  $schema;
  isValid = (value) => {
  };
  isValidNullOrUndefined = isValidNullOrUndefined.bind(this);
  validateType(value) {
    return null;
  }
  // Convert data to string format for display/storage
  stringify = (value) => {
    return "";
  };
  //  Convert a string to the correct type.
  coerce(value) {
    return null;
  }
  // Returns the valid value or null. Ensure data strictly matches your schema
  validate(value) {
    if (value === null && !this.$schema.nullable) return null;
    if (value === void 0 && !this.$schema.optional) return null;
    return this.validateType(value);
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
    if (!this.isValidNullOrUndefined(value)) {
      return false;
    }
    return Object.entries(value).every(([key, value2]) => {
      const validator = this.$schema.shape[key];
      if (!validator) return false;
      return validator.isValid(value2);
    });
  };
  optional() {
    this.$schema.optional = true;
    return this;
  }
  nullable() {
    this.$schema.nullable = true;
    return this;
  }
  validate(value) {
    if (typeof value !== "object" || value === null) return null;
    let allValid = true;
    const validValue = Object.entries(this.$schema.shape).reduce((acc, [key, validator]) => {
      const parsedValue = validator.validate(value[key]);
      const valid = validator.$schema.optional && value[key] === void 0 || validator.$schema.nullable && value[key] === null;
      allValid = allValid && valid;
      Object.assign(acc, { [key]: valid ? parsedValue : void 0 });
      return acc;
    }, {});
    console.log({ validValue, allValid });
    return allValid ? validValue : null;
  }
  coerce(value) {
    return this.validate(value);
  }
}
const NULL = `$/_NULL_/$`;
const CONTEXT_KEY = "SYNCED_STATE_CONTEXT";
const getInitialStringifiedValue = (value, validator) => {
  if (validator.$schema.kind === "array" || validator.$schema.kind === "object") {
    return void 0;
  }
  const DEFAULT_VALUE = value === null ? null : value ?? validator.$schema.default;
  const isValid = validator.isValid(DEFAULT_VALUE);
  if (!isValid) {
    return void 0;
  }
  if (DEFAULT_VALUE !== void 0) {
    const stringifiedDefaultValue = validator.stringify(DEFAULT_VALUE);
    return stringifiedDefaultValue;
  }
};
class BaseSyncedType {
  INTERNAL_ID;
  yType;
  rawValue = "";
  observeCallback;
  constructor(yType) {
    this.INTERNAL_ID = crypto.randomUUID();
    this.yType = yType;
    this.rawValue = yType.toString();
    this.yType.observe(this.observe);
  }
  observe = (e, transact) => {
    if (transact.origin !== this.INTERNAL_ID) {
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
      this.yType.doc?.transact(
        () => {
          this.yType.applyDelta(length ? [
            { delete: length },
            { insert: value ?? NULL }
          ] : [{ insert: value ?? NULL }]);
        },
        this.INTERNAL_ID
      );
    }
  }
  [Symbol.dispose]() {
    this.destroy();
  }
}
class SyncedEnum extends BaseSyncedType {
  validator;
  get value() {
    return this.validator.coerce(this.rawValue);
  }
  set value(value) {
    if (!this.validator.isValid(value)) {
      console.error("Invalid value", { value });
      return;
    }
    this.setYValue(this.validator.stringify(value));
  }
  constructor(yType, validator) {
    super(yType);
    this.validator = validator;
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
    return this.rawValue === NULL || !this.rawValue ? null : this.date;
  }
  set value(value) {
    const isValid = this.validator.isValid(value);
    if (!isValid) {
      console.error("Invalid value", { value });
      return;
    }
    if (value !== null && value !== void 0) {
      this.setYValue(new Date(value).toISOString());
      this.date.setTime(new Date(value).getTime());
    } else {
      this.setYValue(null);
      this.date.setTime(0);
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
  constructor(yType, validator) {
    super(yType);
    this.validator = validator;
    this.setValue(this.rawValue);
  }
}
class SyncedBoolean extends BaseSyncedType {
  validator;
  get value() {
    return this.validator.coerce(this.rawValue);
  }
  set value(value) {
    if (!this.validator.isValid(value)) {
      console.error("Invalid value", { value });
      return;
    }
    this.setYValue(this.validator.stringify(value));
  }
  constructor(yType, validator) {
    super(yType);
    this.validator = validator;
  }
}
class SyncedText extends BaseSyncedType {
  validator;
  get value() {
    return this.rawValue === NULL ? null : this.rawValue;
  }
  set value(value) {
    console.log(this.validator.isValid(value));
    if (!this.validator.isValid(value)) {
      console.error("Invalid value", { value });
      return;
    }
    this.setYValue(value);
  }
  constructor(yType, validator) {
    super(yType);
    this.validator = validator;
  }
}
class SyncedNumber extends BaseSyncedType {
  validator;
  get value() {
    return this.validator.coerce(this.rawValue);
  }
  set value(value) {
    if (!this.validator.isValid(value)) {
      console.error("Invalid value", { value });
      return;
    }
    this.setYValue(this.validator.stringify(value));
  }
  constructor(yType, validator) {
    super(yType);
    this.validator = validator;
  }
}
function propertyToNumber(p) {
  if (typeof p === "string" && p.trim().length) {
    const asNum = Number(p);
    if (Number.isInteger(asNum)) {
      return asNum;
    }
  }
  return p;
}
class SyncedArray {
  INTERNAL_ID = crypto.randomUUID();
  validator;
  yType;
  syncroStates = [];
  proxy;
  get array() {
    return this.syncroStates.map((state) => state.value);
  }
  deleteProperty = (target, pArg) => {
    const p = propertyToNumber(pArg);
    if (typeof p !== "number") {
      return true;
    }
    if (!this.validator.$schema.shape.$schema.optional) {
      console.error("Can not delete non optional property", p);
      return true;
    }
    const syncroState2 = this.syncroStates[p];
    if (!syncroState2) {
      console.error("Index does not exist", p);
      return true;
    }
    syncroState2.value = void 0;
    return true;
  };
  set value(value) {
    if (!this.validator.isValid(value)) {
      console.error("Invalid value", { value });
      return;
    }
    this.transact(() => {
      const remainingStates = this.syncroStates.slice(value.length);
      remainingStates.forEach((state) => {
        state.destroy();
      });
      if (remainingStates.length) {
        this.yType.delete(value.length, remainingStates.length);
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
            parent: this.yType,
            value: item
          });
        }
      });
    });
  }
  get value() {
    this.syncroStates;
    return this.proxy;
  }
  constructor({ validator, yType, value }) {
    this.validator = validator;
    this.yType = yType;
    yType.observe(this.observe);
    const shape = this.validator.$schema.shape;
    this.proxy = new Proxy([], {
      get: (target, pArg, receiver) => {
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
      deleteProperty: this.deleteProperty,
      set: (target, pArg, value2) => {
        const p = propertyToNumber(pArg);
        if (Number.isInteger(p)) {
          if (value2 === void 0) {
            return this.deleteProperty(target, p);
          }
          const syncroState2 = this.syncroStates[p];
          if (!syncroState2) {
            this.transact(() => {
              this.syncroStates[p] = createSyncroState({
                key: p,
                validator: shape,
                parent: this.yType,
                value: value2
              });
            });
          } else {
            syncroState2.value = value2;
          }
        }
        return true;
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
    this.sync(value || this.validator.$schema.default || []);
  }
  transact = (fn) => {
    this.yType.doc?.transact(
      () => {
        fn();
      },
      this.INTERNAL_ID
    );
  };
  toJSON = () => {
    return this.array;
  };
  sync = (value) => {
    this.syncroStates = [];
    this.yType.forEach((item, index) => {
      this.syncroStates[index] = createSyncroState({
        key: index,
        validator: this.validator.$schema.shape,
        parent: this.yType,
        value: value?.[index]
      });
    });
  };
  observe = (e, _transaction) => {
    if (_transaction.origin === this.INTERNAL_ID) {
      console.log("same origin");
      return;
    }
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
        console.log({ deleted, start, _delete });
        start -= _delete;
      }
      if (Array.isArray(insert)) {
        for (let i = 0; i < insert.length; i++) {
          this.syncroStates.splice(start, 0, createSyncroState({
            key: start,
            validator: this.validator.$schema.shape,
            parent: this.yType
          }));
          start += i + 1;
        }
      }
    });
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
      this.transact(() => {
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
      this.transact(() => {
        this.yType.delete(0, 1);
        first?.destroy();
      });
      return first?.value;
    },
    unshift: (...items) => {
      let result;
      this.transact(() => {
        result = this.syncroStates.unshift(...items.map((item, index) => {
          return createSyncroState({
            forceNewType: true,
            key: index,
            validator: this.validator.$schema.shape,
            parent: this.yType,
            value: item
          });
        }));
      });
      return result;
    },
    push: (...items) => {
      this.transact(() => {
        this.syncroStates.push(...items.map((item, index) => {
          return createSyncroState({
            key: this.yType.length,
            validator: this.validator.$schema.shape,
            parent: this.yType,
            value: item
          });
        }));
      });
    },
    splice: (start, deleteCount, ..._items) => {
      let result = [];
      this.transact(() => {
        const newSyncroStates = _items.map((item, index) => {
          console.log(start + index, item);
          this.yType.delete(start, deleteCount);
          return createSyncroState({
            key: start + index,
            forceNewType: true,
            validator: this.validator.$schema.shape,
            parent: this.yType,
            value: item
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
const safeSetContext = (key, value) => {
  try {
    setContext(key, value);
  } catch (e) {
  }
};
const syncroState = ({ schema, connect }) => {
  let remotlySynced = false;
  let locallySynced = false;
  let connectionStatus = "DISCONNECTED";
  const schemaState = schema;
  const doc = new Y.Doc();
  const awareness = new Awareness(doc);
  const schemaValidator = new ObjectValidator(schemaState);
  const stateMap = doc.getMap("$state");
  const syncroStateContext = { id: crypto.randomUUID() };
  const undoManager = new Y.UndoManager(stateMap);
  safeSetContext(CONTEXT_KEY, syncroStateContext);
  const syncroStateProxy = new SyncedObject({
    validator: schemaValidator,
    observe: false,
    yType: stateMap,
    baseImplementation: {
      $doc: doc,
      $state: stateMap,
      $connected: false,
      $connectionStatus: connectionStatus,
      $destroy: () => {
        undoManager.destroy();
        awareness.destroy();
      },
      get $remotlySynced() {
        return remotlySynced;
      },
      $locallySynced: locallySynced,
      $undo: () => {
        if (undoManager?.canUndo()) {
          undoManager.undo();
        }
      },
      $redo: () => {
        if (undoManager?.canRedo()) {
          undoManager.redo();
        }
      },
      $awareness: awareness,
      $snapshot: {}
    }
  });
  return syncroStateProxy.value;
};
const createSyncroState = ({
  key,
  validator,
  parent,
  forceNewType,
  value
}) => {
  const initialValue = getInitialStringifiedValue(value, validator);
  const type = getTypeFromParent({
    forceNewType,
    parent,
    key,
    validator,
    value: initialValue
  });
  switch (validator.$schema.kind) {
    default:
    case "string": {
      return new SyncedText(type, validator);
    }
    case "number": {
      return new SyncedNumber(type, validator);
    }
    case "boolean": {
      return new SyncedBoolean(type, validator);
    }
    case "date": {
      return new SyncedDate(type, validator);
    }
    case "enum": {
      return new SyncedEnum(type, validator);
    }
    case "object": {
      return new SyncedObject({
        yType: type,
        validator,
        baseImplementation: {},
        value
      });
    }
    case "array": {
      return new SyncedArray({ yType: type, validator, value });
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
  isValid = (value) => {
    if (!Array.isArray(value)) return false;
    if (!this.isValidNullOrUndefined(value)) {
      return false;
    }
    return value.every((item) => this.$schema.shape.isValid(item));
  };
  optional() {
    this.$schema.optional = true;
    return this;
  }
  nullable() {
    this.$schema.nullable = true;
    return this;
  }
  validate(value) {
    if (typeof value !== "object" || value === null) return null;
    if (!Array.isArray(value)) return null;
    const isNullable = this.$schema.nullable;
    const allValid = value.every(
      (item) => this.$schema.shape.validate(item) !== null || isNullable && item === null
    );
    return allValid ? value : null;
  }
  coerce(value) {
    return this.validate(value);
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
  isValid = (value) => {
    if (!this.isValidNullOrUndefined(value)) {
      return false;
    }
    if (typeof value !== "boolean") return false;
    return true;
  };
  parse(value) {
    const coerced = this.coerce(value);
    return {
      isValid: this.isValid(coerced),
      value: coerced
    };
  }
  coerce(value) {
    if (value === "true") return true;
    if (value === "false") return false;
    if (value === NULL || value === null) return null;
    if (Number(value) === 1) return true;
    if (Number(value) === 0) return false;
    return null;
  }
  stringify = (value) => {
    if (value === null) return NULL;
    const coercedValue = this.coerce(value);
    return coercedValue ? String(coercedValue) : "";
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
  isValid = (value) => {
    if (!this.isValidNullOrUndefined(value)) {
      return false;
    }
    if (typeof value === "string" && !this.isStringADate(value)) {
      return false;
    }
    return true;
  };
  parse(value) {
    const coerced = this.coerce(value);
    return {
      isValid: this.isValid(coerced),
      value: coerced
    };
  }
  coerce(value) {
    if (value === NULL || value === null) return null;
    if (this.isStringADate(value)) {
      return new Date(value);
    }
    if (Number.isInteger(Number(value)) && !isNaN(Number(value)) && !isNaN(new Date(Number(value)).getTime())) {
      return new Date(Number(value));
    }
    return null;
  }
  stringify = (value) => {
    return this.coerce(value)?.toISOString() ?? "";
  };
}
class EnumValidator extends BaseValidator {
  constructor(...values) {
    super({ kind: "enum", optional: false, nullable: false, values: new Set(values) });
  }
  isValid = (value) => {
    if (!this.isValidNullOrUndefined(value)) {
      return false;
    }
    return this.$schema.values.has(value);
  };
  parse(value) {
    const coerced = this.coerce(value);
    return {
      isValid: this.isValid(coerced),
      value: coerced
    };
  }
  coerce(value) {
    if (value === NULL || value === null) return null;
    if (this.$schema.values.has(value)) return value;
    return null;
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
  isValid = (value) => {
    if (!this.isValidNullOrUndefined(value)) {
      return false;
    }
    if (typeof value !== "string") return false;
    if (this.$schema.min && value.length < this.$schema.min) return false;
    if (this.$schema.max && value.length > this.$schema.max) return false;
    if (this.$schema.pattern && !this.$schema.pattern.test(value)) return false;
    return true;
  };
  parse(value) {
    const coerced = this.coerce(value);
    return {
      isValid: this.isValid(coerced),
      value: coerced
    };
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
  coerce(value) {
    if (value === NULL) return null;
    return value;
  }
  stringify = (value) => {
    if (value === null) return NULL;
    return this.coerce(value)?.toString() ?? "";
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
  isValid = (value) => {
    if (!this.isValidNullOrUndefined(value)) {
      return false;
    }
    return typeof value === "number" && !isNaN(Number(value));
  };
  parse(value) {
    const coerced = this.coerce(value);
    return {
      isValid: this.isValid(coerced),
      value: coerced
    };
  }
  coerce(value) {
    if (value === NULL || value === null) return null;
    const parsed = Number(value);
    return parsed;
  }
  stringify = (value) => {
    if (value === null) return NULL;
    return this.coerce(value) ? String(value) : "";
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
({
  a: y.string().optional(),
  b: y.object({
    c: y.string()
  }),
  e: y.enum("a", "b", "c"),
  f: y.array(y.string().nullable())
});
y.string().nullable();
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
  if (synced.$remotlySynced) {
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
