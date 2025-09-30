import * as Y from "yjs";
import { NULL } from "../constants.js";
import type { SyncedContainer } from "./common.js";
import type { State } from "./syncroState.js";
import type { ProviderState } from "../provider.js";

type ObserverCallback = (e: Y.YEvent<Y.Text>, transact: Y.Transaction) => void;

export class BaseSyncedType {
  yType: Y.Text;
  rawValue: ProviderState<string | null>;
  observeCallback?: ObserverCallback;
  state: State;
  parent: SyncedContainer;
  key: string | number;
  constructor(opts: {
    yType: Y.Text;
    key: string | number;
    parent: SyncedContainer;
    state: State;
  }) {
    this.yType = opts.yType;
    this.rawValue = opts.state.provider.state(opts.yType.toString());
    this.yType.observe(this.observe);
    this.parent = opts.parent;
    this.key = opts.key;
    this.state = opts.state;
  }

  deletePropertyFromParent = () => {
    this.parent.deleteProperty({}, this.key);
  };

  observe = (e: Y.YEvent<Y.Text>, transact: Y.Transaction) => {
    if (transact.origin !== this.state.transactionKey) {
      this.rawValue.value = this.yType.toString();
      this.observeCallback?.(e, transact);
    }
  };

  destroy = () => {
    this.yType.unobserve(this.observe);
  };

  setYValue(value: string | null) {
    if (this.rawValue.value !== value) {
      const length = this.yType.length;
      this.rawValue.value = value;
      this.state.transaction(() => {
        this.yType.applyDelta(
          length
            ? [{ delete: length }, { insert: value ?? NULL }]
            : [{ insert: value ?? NULL }]
        );
      });
    }
  }
}
