import {
	syncroState as coreSyncroState,
	type SyncroStateOptions,
	usePresence as coreUsePresence,
	type ObjectShape
} from '@syncrostate/core';
import { getContext } from 'svelte';
import { SvelteProvider } from './provider.svelte.js';
export { y } from '@syncrostate/core';

export const syncroState = <T extends ObjectShape, P extends ObjectShape>(
	options: Omit<SyncroStateOptions<T>, 'provider'>
) => {
	return coreSyncroState<T, P>({
		...options,
		provider: new SvelteProvider()
	});
};

export const usePresence = () => {
	return coreUsePresence(getContext);
};
