import { Awareness as YAwareness } from 'y-protocols/awareness';
import { Doc } from 'yjs';
export type PresenceUser = Record<string, string | number | boolean>;
export declare class Presence<T = any> {
    private awareness;
    private id;
    private synced;
    me: PresenceUser | undefined;
    others: PresenceUser[];
    constructor({ doc, awareness }: {
        doc: Doc;
        awareness?: YAwareness;
    });
    private setOthers;
    init: ({ me, awareness }: {
        me?: PresenceUser;
        awareness?: YAwareness;
    }) => void;
}
export declare const usePresence: <T>() => {
    others: PresenceUser[];
    me: PresenceUser | undefined;
};
