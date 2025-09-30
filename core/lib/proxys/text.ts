import type { StringValidator } from "../schemas/string.js";
import * as Y from "yjs";
import { BaseSyncedType } from "./base.js";
import { NULL } from "../constants.js";
import { logError } from "../utils.js";
import type { State } from "./syncroState.js";
import type { SyncedContainer } from "./common.js";

export class SyncedText extends BaseSyncedType {
  validator: StringValidator;

  get value() {
    return this.rawValue.value === NULL ? null : this.rawValue.value;
  }
  set value(value: string | null) {
    const isValid = this.validator.isValid(value);
    if (!isValid) {
      logError("Invalid value", { value });
      return;
    }
    if (value === undefined) {
      this.deletePropertyFromParent();
    } else {
      this.setYValue(this.validator.stringify(value));
    }
  }

  constructor(opts: {
    yType: Y.Text;
    validator: StringValidator;
    parent: SyncedContainer;
    key: string | number;
    state: State;
  }) {
    super(opts);
    this.validator = opts.validator;
  }
}
