import type { SyncedStates } from './proxys/syncedState.svelte.js';
import * as Y from 'yjs';

export const toJSON = (path: string, type: Y.Map<any> | Y.Doc, syncedStates: SyncedStates) => {
	if (type instanceof Y.Array) {
		return [];
	} else {
		let result = {};
		const keys = type instanceof Y.Map ? type.keys() : type.share.keys();
		for (const key of keys) {
			const nestedSyncedState = syncedStates.get(`${path}.${key}`);
			if (!nestedSyncedState) {
				Object.assign(result, { [key]: null });
			} else {
				if (nestedSyncedState.type instanceof Y.Text) {
					Object.assign(result, { [key]: nestedSyncedState.state?.value || null });
				} else {
					const nested = type instanceof Y.Map ? type.get(key) : type.share.get(key);
					Object.assign(result, { [key]: toJSON(`${path}.${key}`, nested, syncedStates) });
				}
			}
		}
		return result;
	}
};
