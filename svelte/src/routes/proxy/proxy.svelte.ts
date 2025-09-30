import { untrack } from 'svelte';

export const createProxy = () => {
	const states = $state({});
	return new Proxy(
		untrack(() => {
			return {};
		}) as any,
		{
			get() {
				return 'hello';
			}
		}
	);
};
