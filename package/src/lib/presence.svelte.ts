import { Awareness as YAwareness } from 'y-protocols/awareness';
import { Doc } from 'yjs';
import { PRENSENCE, PRENSENCE_ID, PRESENCE_CONTEXT_KEY } from './constants.js';
import { getContext } from 'svelte';

export type PresenceUser = Record<string, string | number | boolean>;

export class Presence<T = any> {
	private awareness: YAwareness;
	private id = $state<string>();
	private synced = $state(false);
	me = $state<PresenceUser>();
	others = $state<PresenceUser[]>([]);

	constructor({ doc, awareness }: { doc: Doc; awareness?: YAwareness }) {
		this.awareness = awareness ?? new YAwareness(doc);

		$effect(() => {
			if (this.synced) {
				this.awareness.setLocalStateField(PRENSENCE, this.me);
			}
		});
	}

	private setOthers = () => {
		const users = Array.from(this.awareness.getStates().values());

		this.others = users
			.filter((user) => user.id !== this.id)
			.reduce((acc, user) => {
				if (user[PRENSENCE_ID] && user[PRENSENCE_ID] !== this.id) {
					acc.push(user[PRENSENCE]);
				}
				return acc;
			}, [] as any);
	};
	init = ({ me = {}, awareness }: { me?: PresenceUser; awareness?: YAwareness }) => {
		if (awareness) {
			this.awareness = awareness;
		}
		if (me.id && typeof me.id === 'string') {
			this.id = me.id as string;
		}
		this.me = me;
		this.synced = true;
		this.awareness.setLocalStateField(PRENSENCE_ID, this.id);
		this.awareness.setLocalStateField(PRENSENCE, this.me);
		this.setOthers();

		this.awareness.on('update', this.setOthers);
	};
}

export const usePresence = <T>() => {
	const presence = getContext(PRESENCE_CONTEXT_KEY) as Presence<T>;
	return {
		others: presence.others,
		me: presence.me
	};
};
