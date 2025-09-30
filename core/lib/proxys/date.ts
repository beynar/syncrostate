import * as Y from "yjs";
import type { DateValidator } from "../schemas/date.js";
import { NULL } from "../constants.js";
import { BaseSyncedType } from "./base.js";
import type { SyncedContainer } from "./common.js";
import { logError } from "../utils.js";
import type { State } from "./syncroState.js";
import type { Provider } from "../provider.js";
// 🚨🚨🚨 design decision: date are defaulted to new Date() if not optionnal or nullable and the value does not exist in the document.

const SvelteDateProxy = (onSet: () => void, provider: Provider) => {
  const date = new provider.Date();

  class SyncedDate extends provider.Date {
    constructor(...args: any[]) {
      // @ts-ignore
      super(...args);

      var proto = SyncedDate.prototype;
      var date_proto = provider.Date.prototype;

      var methods =
        /** @type {Array<keyof Date & string>} */ Object.getOwnPropertyNames(
          date_proto
        );

      for (const method of methods) {
        if (method.startsWith("set")) {
          // @ts-ignore
          proto[method] = function (...args) {
            // @ts-ignore
            var result = date_proto[method].apply(this, args);
            onSet();
            return result;
          };
        }
      }
    }
  }

  return new SyncedDate();
  // return new Proxy(date, {
  //   get(target, prop) {
  //     const result = Reflect.get(target, prop);
  //     console.log("result", result,prop);
  //     if (typeof result === "function") {
  //       return (...args: any[]) => {
  //         const ret = result.call(target, ...args);
  //         if (typeof prop === "string" && prop.startsWith("set")) {
  //           onSet();
  //         }
  //         return ret;
  //       };
  //     } else {
  //       return result;
  //     }

  //   },

  // });
};

export class SyncedDate extends BaseSyncedType {
  validator: DateValidator;

  date: Date;

  get value() {
    const value =
      this.rawValue.value === NULL || !this.rawValue.value ? null : this.date;
    if (!this.validator.$schema.nullable && value === null) {
      return this.date;
    }
    if (!this.validator.$schema.optional && value === undefined) {
      return this.date;
    }
    return value;
  }

  set value(value: Date | null | string | number) {
    const isValid = this.validator.isValid(value);
    if (!isValid) {
      logError("Invalid value", { value });
      return;
    }
    if (value !== null && value !== undefined) {
      this.setYValue(new Date(value).toISOString());
      this.date.setTime(new Date(value).getTime());
    } else {
      if (value === undefined) {
        this.deletePropertyFromParent();
      } else {
        this.setYValue(null);
        this.date.setTime(0);
      }
    }
  }

  setValue = (string: string | null) => {
    const { isValid, value } = this.validator.parse(string);
    if (isValid) {
      this.date.setTime(value?.getTime() || 0);
    }
  };

  observeCallback = () => {
    this.setValue(this.rawValue.value);
  };

  constructor(opts: {
    yType: Y.Text;
    validator: DateValidator;
    parent: SyncedContainer;
    key: string | number;
    state: State;
  }) {
    super(opts);
    this.date = SvelteDateProxy(() => {
      const newRawValue = this.date.toISOString();
      const isNull = this.date.getTime() === 0;
      if (newRawValue !== this.rawValue.value && !isNull) {
        this.setYValue(newRawValue);
      }
    }, opts.state.provider);
    this.validator = opts.validator;
    this.setValue(this.rawValue.value);
  }
}
