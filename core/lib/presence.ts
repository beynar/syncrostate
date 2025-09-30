import { Awareness as YAwareness } from "y-protocols/awareness";
import { Doc } from "yjs";
import { PRENSENCE, PRENSENCE_ID, PRESENCE_CONTEXT_KEY } from "./constants.js";
import type { Provider } from "./provider.js";

export type PresenceUser = Record<string, string | number | boolean>;

export class Presence<T = any> {
  private awareness: YAwareness;
  private provider: Provider;
  private id: { value: string };
  private synced: { value: boolean };
  me: { value: PresenceUser };
  others: { value: PresenceUser[] };

  constructor({
    doc,
    awareness,
    provider,
  }: {
    doc: Doc;
    awareness?: YAwareness;
    provider: Provider;
  }) {
    this.awareness = awareness ?? new YAwareness(doc);
    this.provider = provider;

    this.id = provider.state("");
    this.synced = provider.state(false);
    this.me = provider.state({});
    this.others = provider.state([]);

    provider.effect(() => {
      if (this.synced.value) {
        this.awareness.setLocalStateField(PRENSENCE, this.me.value);
      }
    }, []);
  }

  private setOthers = () => {
    const users = Array.from(this.awareness.getStates().values());

    this.others.value = users
      .filter((user) => user.id !== this.id.value)
      .reduce((acc, user) => {
        if (user[PRENSENCE_ID] && user[PRENSENCE_ID] !== this.id.value) {
          acc.push(user[PRENSENCE]);
        }
        return acc;
      }, [] as any);
  };
  init = ({
    me = {},
    awareness,
  }: {
    me?: PresenceUser;
    awareness?: YAwareness;
  }) => {
    if (awareness) {
      this.awareness = awareness;
    }
    if (me.id && typeof me.id === "string") {
      this.id.value = me.id as string;
    }
    this.me.value = me;
    this.synced.value = true;
    this.awareness.setLocalStateField(PRENSENCE_ID, this.id.value);
    this.awareness.setLocalStateField(PRENSENCE, this.me.value);
    this.setOthers();

    this.awareness.on("update", this.setOthers);
  };
}

export const usePresence = <T>(getContext: (key: string) => any) => {
  const presence = getContext(PRESENCE_CONTEXT_KEY) as Presence<T>;
  return {
    others: presence.others,
    me: presence.me,
  };
};
