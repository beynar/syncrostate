import {
  syncroState as coreSyncroState,
  type SyncroStateOptions,
  usePresence as coreUsePresence,
  type ObjectShape,
} from "@syncrostate/core";
import { VanillaProvider } from "./provider";

export { y } from "@syncrostate/core";

export const syncroState = <T extends ObjectShape, P extends ObjectShape>(
  options: Omit<SyncroStateOptions<T>, "provider">
) => {
  return coreSyncroState<T, P>({
    ...options,
    provider: new VanillaProvider(),
  });
};
