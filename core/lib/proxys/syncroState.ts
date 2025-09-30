import type { SchemaOutput } from "../schemas/schema.js";
import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import { SyncedObject } from "./object.js";
import { ObjectValidator, type ObjectShape } from "../schemas/object.js";
import type { Validator } from "../schemas/schema.js";
import { SyncedEnum } from "./enum.js";
import { SyncedDate } from "./date.js";
import { SyncedBoolean } from "./boolean.js";
import type { StringValidator } from "../schemas/string.js";
import type { NumberValidator } from "../schemas/number.js";
import type { EnumValidator } from "../schemas/enum.js";
import type { DateValidator } from "../schemas/date.js";
import type { BooleanValidator } from "../schemas/boolean.js";
import { SyncedText } from "./text.js";
import { SyncedNumber } from "./number.js";
import {
  getInitialStringifiedValue,
  getTypeFromParent,
  logError,
} from "../utils.js";
import { CONTEXT_KEY, INITIALIZED, TRANSACTION_KEY } from "../constants.js";
import { SyncedArray } from "./array.js";
import type { ArrayValidator } from "../schemas/array.js";
import type { SyncedContainer } from "./common.js";
import { SyncedSet } from "./set.js";
import type { SetValidator } from "../schemas/set.js";
import { Presence, type PresenceUser } from "../presence.js";
import { SyncedMap } from "./map.js";
import type { MapValidator } from "../schemas/map.js";
import type { LiteralValidator } from "../schemas/literal.js";
import type { DiscriminatedUnionValidator } from "../schemas/discriminatedUnion.js";
import { SyncedDiscriminatedUnion } from "./discriminatedUnion.js";
import type { Provider } from "../provider.js";

export type SyncroStates =
  | SyncedText
  | SyncedNumber
  | SyncedBoolean
  | SyncedDate
  | SyncedEnum
  | SyncedObject
  | SyncedArray
  | SyncedSet
  | SyncedMap
  | SyncedDiscriminatedUnion;

export type State<P extends ObjectShape = ObjectShape> = {
  synced: boolean;
  awareness: Awareness;
  doc: Y.Doc;
  undoManager: Y.UndoManager;
  initialized: boolean;
  transaction: (fn: () => void) => void;
  transactionKey: any;
  presence: Presence<P>;
  undo: () => void;
  redo: () => void;
  provider: Provider;
};

export type SyncroStateOptions<T extends ObjectShape> = {
  schema: T;
  doc?: Y.Doc;
  awareness?: Awareness;
  presence?: Omit<PresenceUser, "$/_PRENSENCE_ID_/$">;
  provider: Provider;
  sync?: ({
    doc,
    awareness,
    synced,
  }: {
    doc: Y.Doc;
    awareness: Awareness;
    synced: (provider?: any) => void;
  }) => Promise<void>;
};

export const syncroState = <T extends ObjectShape, P extends ObjectShape>({
  schema,
  sync,
  doc: customDoc,
  awareness: customAwareness,
  presence: p,
  provider,
}: SyncroStateOptions<T>): SchemaOutput<T> => {
  const doc = customDoc ?? new Y.Doc();
  const awareness = customAwareness ?? new Awareness(doc);
  const presence = new Presence({ doc, awareness, provider });
  const schemaValidator = new ObjectValidator(schema);
  const stateMap = doc.getMap("$state");
  const undoManager = new Y.UndoManager(stateMap);
  const transactionKey = new TRANSACTION_KEY();
  let state = provider.state<State>({
    synced: sync ? false : true,
    initialized: false,
    awareness,
    doc,
    undoManager,
    presence: presence as Presence<P>,
    provider,
    transaction: (fn: () => void) => {
      state.value.doc.transact(fn, transactionKey);
    },
    transactionKey,
    undo: () => {
      if (undoManager?.canUndo()) {
        undoManager.undo();
      }
    },
    redo: () => {
      if (undoManager?.canRedo()) {
        undoManager.redo();
      }
    },
  });
  provider.setContext(CONTEXT_KEY, state);

  const syncroStateProxy = new SyncedObject({
    // @ts-ignore
    parent: {
      // TODO: does this need to be fixed ? Is this even used a some point ? idk
      deleteProperty(target, pArg) {
        logError("Not allowed");
        return true;
      },
    },
    state: state.value,
    key: "$state",
    validator: schemaValidator,
    observe: false,
    yType: stateMap,
  });

  const initialize = (doc: Y.Doc, cb: () => void) => {
    const text = doc.getText(INITIALIZED);
    const initialized = text?.toString() === INITIALIZED;
    Object.assign(doc, { initialized });
    state.value.initialized = initialized;
    cb();
    state.value.initialized = true;
    Object.assign(doc, { initialized: true });
    if (!initialized) {
      text.delete(0, text.length);
      text.insert(0, INITIALIZED);
    }
  };

  const synced = (provider?: any) => {
    initialize(doc, () => {
      syncroStateProxy.sync(syncroStateProxy.value);
      stateMap.observe(syncroStateProxy.observe);
      presence.init({ me: p, awareness: provider?.awareness });
      state.value.synced = true;
    });
  };

  if (!sync) {
    synced();
  }

  provider.onMount(() => {
    if (sync) {
      sync({ doc, awareness, synced });
    }
  });

  return syncroStateProxy.value;
};

export const createSyncroState = ({
  key,
  validator,
  forceNewType,
  value,
  parent,
  state,
  forceValue,
}: {
  key: string | number;
  validator: Validator;
  value?: any;
  forceNewType?: boolean;
  parent: SyncedContainer;
  state: State;
  forceValue?: boolean;
}): SyncroStates => {
  const type = getTypeFromParent({
    forceNewType,
    parent: parent.yType,
    key,
    validator,
    value,
  });

  if (forceValue && type instanceof Y.Text) {
    const stringifiedValue = getInitialStringifiedValue(value, validator);
    if (
      typeof stringifiedValue === "string" &&
      stringifiedValue !== type.toString()
    ) {
      state.transaction(() => {
        type.applyDelta([
          { delete: type.length },
          { insert: stringifiedValue },
        ]);
      });
    }
  }

  switch (validator.$schema.kind) {
    default:
    case "string": {
      return new SyncedText({
        yType: type as Y.Text,
        validator: validator as StringValidator,
        parent,
        key,
        state,
      });
    }
    case "number": {
      return new SyncedNumber({
        yType: type as Y.Text,
        validator: validator as NumberValidator,
        parent,
        key,
        state,
      });
    }
    case "boolean": {
      return new SyncedBoolean({
        yType: type as Y.Text,
        validator: validator as BooleanValidator,
        parent,
        key,
        state,
      });
    }
    case "date": {
      return new SyncedDate({
        yType: type as Y.Text,
        validator: validator as DateValidator,
        parent,
        key,
        state,
      });
    }
    case "enum": {
      return new SyncedEnum({
        yType: type as Y.Text,
        validator: validator as EnumValidator<any, any, any>,
        parent,
        key,
        state,
      });
    }
    case "object": {
      return new SyncedObject({
        yType: type as Y.Map<any>,
        validator: validator as ObjectValidator<any>,
        baseImplementation: {},
        value,
        parent,
        key,
        state,
      });
    }
    case "set": {
      return new SyncedSet({
        yType: type as Y.Array<any>,
        validator: validator as SetValidator<any>,
        value,
        parent,
        key,
        state,
      });
    }
    case "array": {
      return new SyncedArray({
        yType: type as Y.Array<any>,
        validator: validator as ArrayValidator<any>,
        value,
        parent,
        key,
        state,
      });
    }
    case "map": {
      return new SyncedMap({
        yType: type as Y.Map<any>,
        validator: validator as MapValidator<any>,
        value,
        parent,
        key,
        state,
      });
    }
    case "literal": {
      // Literals are stored as text since they're primitive values
      return new SyncedText({
        yType: type as Y.Text,
        validator: validator as LiteralValidator<any> as any,
        parent,
        key,
        state,
      });
    }
    case "discriminatedUnion": {
      return new SyncedDiscriminatedUnion({
        yType: type as Y.Map<any>,
        validator: validator as DiscriminatedUnionValidator<any, any>,
        value,
        parent,
        key,
        state,
      });
    }
  }
};
