<svelte:options runes />

<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';
	import Test from './Test.svelte';
	import { createProxy } from './proxy.svelte.js';

	// class States {
	// 	states = new SvelteMap<string, ProxyState>();
	// }

	// const states = new States();
	// class ProxyState {
	// 	rawValue = $state('');

	// 	get value() {
	// 		return this.rawValue;
	// 	}

	// 	set value(value: any) {
	// 		this.rawValue = value;
	// 	}

	// 	constructor(data: any) {
	// 		this.rawValue = data;
	// 	}
	// }

	// const arizona = new ProxyState('arizona');
	// const marseille = new ProxyState('marseille');

	// states.states.set('arizona', arizona);
	// states.states.set('marseille', marseille);

	// const data = {
	// 	arizona: 'arizona',
	// 	marseille: 'marseille'
	// };

	// const proxyIntegration = (states: States) => {
	// 	return {
	// 		get(target: any, prop: string) {
	// 			// If property exists and is an object, wrap it in a proxy too
	// 			const state = states.states.get(prop);
	// 			if (state) {
	// 				return state.value;
	// 			}
	// 			return createRecursiveProxy(states);
	// 		},
	// 		set(target: any, prop: string, value: any) {
	// 			// Set the value

	// 			if (states.states.has(prop)) {
	// 				states.states.get(prop)!.value = value;
	// 			}
	// 			return true;
	// 		}
	// 	};
	// };
	// const createRecursiveProxy = (states: States) => {
	// 	return new Proxy({}, proxyIntegration(states));
	// };

	// const proxiedData = createRecursiveProxy(states) as typeof data;

	let proxiedData = createProxy();
</script>

<Test name={proxiedData.arizona} />

<button
	onclick={() =>
		proxiedData.arizona === 'arizona'
			? (proxiedData.arizona = 'new arizona')
			: (proxiedData.arizona = 'arizona')}
>
	change arizona
</button>
<button
	onclick={() =>
		proxiedData.marseille === 'marseille'
			? (proxiedData.marseille = 'new marseille')
			: (proxiedData.marseille = 'marseille')}
>
	change {proxiedData.marseille}
</button>
