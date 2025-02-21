import { Awareness as YAwareness } from 'y-protocols/awareness';
import { Doc } from 'yjs';
import { PRENSENCE, PRENSENCE_ID, PRESENCE_CONTEXT_KEY } from './constants.js';
import { getContext } from 'svelte';
export class Presence {
    awareness;
    id = $state();
    synced = $state(false);
    me = $state();
    others = $state([]);
    constructor({ doc, awareness }) {
        this.awareness = awareness ?? new YAwareness(doc);
        $effect(() => {
            if (this.synced) {
                this.awareness.setLocalStateField(PRENSENCE, this.me);
            }
        });
    }
    setOthers = () => {
        const users = Array.from(this.awareness.getStates().values());
        this.others = users
            .filter((user) => user.id !== this.id)
            .reduce((acc, user) => {
            if (user[PRENSENCE_ID] && user[PRENSENCE_ID] !== this.id) {
                acc.push(user[PRENSENCE]);
            }
            return acc;
        }, []);
    };
    init = ({ me = {}, awareness }) => {
        if (awareness) {
            this.awareness = awareness;
        }
        if (me.id && typeof me.id === 'string') {
            this.id = me.id;
        }
        this.me = me;
        this.synced = true;
        this.awareness.setLocalStateField(PRENSENCE_ID, this.id);
        this.awareness.setLocalStateField(PRENSENCE, this.me);
        this.setOthers();
        this.awareness.on('update', this.setOthers);
    };
}
export const usePresence = () => {
    const presence = getContext(PRESENCE_CONTEXT_KEY);
    return {
        others: presence.others,
        me: presence.me
    };
};
