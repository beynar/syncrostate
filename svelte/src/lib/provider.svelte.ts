import { SvelteDate, SvelteMap, SvelteSet } from 'svelte/reactivity';
import { onMount, setContext, untrack } from 'svelte';
import { onDestroy } from 'svelte';
import { getContext } from 'svelte';
import type { Provider } from '@syncrostate/core';

const svelteState = <T>(initialValue: T) => {
	let state = $state(initialValue);
	return {
		get value() {
			return state;
		},
		set value(value: T) {
			state = value;
		}
	};
};

const svelteEffect = (cb: () => void, deps?: any[]) => {
	$effect(() => {
		deps;
		untrack(() => {
			cb();
		});
	});
};

const svelteDerived = <T>(cb: () => T) => {
	const derivedValue = $derived.by(cb);
	return {
		get value() {
			return derivedValue;
		}
	};
};

export class SvelteProvider implements Provider {
	state = svelteState;
	effect = svelteEffect;
	derived = svelteDerived;
	Map = SvelteMap;
	Set = SvelteSet;
	onMount = onMount;
	onDestroy = onDestroy;
	Date = SvelteDate as any;
	getContext = getContext;
	setContext = setContext;
}
